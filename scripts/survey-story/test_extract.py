"""Synthetic archive checks; no real survey records are used in tests."""

import hashlib
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from extract import extract


class StoryExtractionTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "archive.sqlite3"
        self.db = sqlite3.connect(self.path)
        self.addCleanup(self.db.close)
        self.db.executescript("""
            CREATE TABLE archive_manifest (document TEXT);
            CREATE TABLE Survey (ID INTEGER PRIMARY KEY, TemplateID INTEGER,
                IsTest INTEGER, State TEXT, IsMigrated INTEGER, CreatedByID INTEGER);
            CREATE TABLE EntitySurvey (ID INTEGER, ParentID INTEGER);
            CREATE TABLE SurveyStep (ID INTEGER PRIMARY KEY, SurveyID INTEGER, TemplateID INTEGER);
            CREATE TABLE SurveyStepTemplate (ID INTEGER PRIMARY KEY, SurveyTemplateID INTEGER);
            CREATE TABLE SurveyQuestionTemplate (ID INTEGER PRIMARY KEY, StepID INTEGER,
                Name TEXT, ClassName TEXT, Label TEXT);
            CREATE TABLE SurveyQuestionValueTemplate (ID INTEGER PRIMARY KEY,
                OwnerID INTEGER, Value TEXT, Label TEXT);
            CREATE TABLE SurveyAnswer (QuestionID INTEGER, StepID INTEGER, Value TEXT);
        """)
        tables = [
            "Survey",
            "SurveyAnswer",
            "SurveyTemplate",
            "SurveyAnswerLog",
            "DeploymentSurvey",
            "Deployment",
        ]
        self.db.execute(
            "INSERT INTO archive_manifest VALUES (?)",
            (
                json.dumps(
                    {
                        "copied_at": "2026-01-01",
                        "tables": {t: {"rows": 0} for t in tables},
                    }
                ),
            ),
        )
        self.db.executemany(
            "INSERT INTO SurveyStepTemplate VALUES (?,?)", [(1, 1), (2, 2)]
        )
        definitions = [
            (1, 2, "DeploymentStage", ["Production / full operational use", "Testing"]),
            (2, 2, "ComputeCores", ["100 to 999 cores", "10,000 to 99,999 cores"]),
            (3, 2, "WorkloadsCategories", ["AI/ML", "Web services"]),
            (4, 1, "BusinessDrivers", ["Avoid vendor lock-in", "Save money"]),
            (5, 1, "NetPromoter", ["10", "0", "8"]),
        ]
        for qid, step, name, choices in definitions:
            self.db.execute(
                "INSERT INTO SurveyQuestionTemplate VALUES (?,?,?,?,?)",
                (qid, step, name, "ChoiceQuestion", name),
            )
            for i, value in enumerate(choices):
                self.db.execute(
                    "INSERT INTO SurveyQuestionValueTemplate VALUES (?,?,?,?)",
                    (qid * 100 + i, qid, value, value),
                )
        for i in range(1, 61):
            self.personal(i)
            self.deployment(i + 100, i)
            self.answer(i + 100, 1, "100" if i <= 40 else "101")
            self.answer(i + 100, 2, "200" if i <= 30 else "201")
            self.answer(i + 100, 3, "300,301" if i <= 15 or 31 <= i <= 50 else "301")
            self.answer(i, 4, "400" if i <= 40 else "401")
            self.answer(i, 5, "500" if i <= 30 else "501" if i <= 50 else "502")

    def personal(self, sid, creator=None, test=0):
        self.db.execute(
            "INSERT INTO Survey VALUES (?,?,?, ?,0,?)",
            (sid, 1, test, "COMPLETE", creator or sid),
        )
        self.db.execute("INSERT INTO SurveyStep VALUES (?,?,1)", (sid, sid))

    def deployment(self, sid, parent, test=0):
        self.db.execute(
            "INSERT INTO Survey VALUES (?,?,?, ?,0,0)", (sid, 2, test, "INCOMPLETE")
        )
        self.db.execute("INSERT INTO EntitySurvey VALUES (?,?)", (sid, parent))
        self.db.execute("INSERT INTO SurveyStep VALUES (?,?,2)", (sid, sid))

    def answer(self, sid, qid, value):
        self.db.execute("INSERT INTO SurveyAnswer VALUES (?,?,?)", (qid, sid, value))

    def result(self):
        self.db.commit()
        return extract(self.path)

    def test_counts_denominators_pairing_and_read_only(self):
        self.db.commit()
        before = hashlib.sha256(self.path.read_bytes()).hexdigest()
        result = self.result()
        y = result["years"][0]
        self.assertEqual(
            y["metrics"]["production"],
            {"n": 60, "count": 40, "pct": 66.7, "completeN": 0},
        )
        self.assertEqual([v["count"] for v in y["scaleAi"]], [15, 20])
        self.assertEqual([v["n"] for v in y["scaleAi"]], [30, 30])
        self.assertEqual(y["nps"], {"n": 60, "score": 16.7})
        self.assertEqual(before, hashlib.sha256(self.path.read_bytes()).hexdigest())
        self.assertNotIn("CreatedByID", json.dumps(result))

    def test_bad_rows_never_inflate_the_story(self):
        self.answer(101, 1, "100")  # identical answer is counted once
        self.answer(
            102, 1, "101"
        )  # conflicting answer removes the record for this question
        self.answer(103, 1, "999")  # unknown dictionary value is not guessed
        self.deployment(900, 1, test=1)
        self.deployment(901, 9999)  # missing parent
        self.personal(902, test=1)
        self.deployment(903, 902)
        for sid in [900, 901, 903]:
            self.answer(sid, 1, "100")
        self.personal(904, creator=7777)
        self.personal(905, creator=7777)
        for sid in [904, 905]:
            self.answer(sid, 4, "400")
        self.answer(1, 1, "100")  # deployment answer attached to a personal step
        y = self.result()["years"][0]
        self.assertEqual(y["metrics"]["production"]["n"], 58)
        self.assertEqual(y["metrics"]["production"]["count"], 38)
        self.assertEqual(y["metrics"]["lockin"]["n"], 60)

    def test_unmapped_choice_is_excluded_and_small_cells_withheld(self):
        self.db.execute("DELETE FROM SurveyAnswer WHERE QuestionID=1")
        for i in range(101, 161):
            self.answer(i, 1, "100" if i <= 109 else "101")
        self.db.execute(
            "UPDATE SurveyAnswer SET Value=? WHERE QuestionID=4 AND StepID=1",
            ("private text must never be exported",),
        )
        result = self.result()
        y = result["years"][0]
        self.assertEqual(
            y["metrics"]["production"], {"n": 60, "count": None, "pct": None}
        )
        self.assertEqual(y["metrics"]["lockin"]["n"], 59)
        self.assertNotIn("private text", json.dumps(result))
        self.assertEqual(result["audit"]["unmappedResponseQuestionsExcluded"], 1)


if __name__ == "__main__":
    unittest.main()
