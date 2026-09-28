#!/usr/bin/env python3
"""SELECT-only, aggregate-only story extraction from the private survey archive.
Run explicitly; never part of the website build. No identities or free text exported.
"""

import argparse
import collections
import datetime
import hashlib
import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path

EDITIONS = [
    ("2015", 1, 2),
    ("2016", 3, 4),
    ("2017 H1", 6, 7),
    ("2017 H2", 8, 9),
    ("2018", 12, 13),
    ("2019", 14, 15),
    ("2020", 36, 37),
    ("2021", 58, 59),
    ("2022", 60, 61),
    ("2023", 64, 65),
    ("2024", 66, 67),
    ("2025", 68, 69),
]
QUESTIONS = {
    "stage": ["DeploymentStage"],
    "cores": ["ComputeCores"],
    "paas": ["PaasTools"],
    "workloads": ["WorkloadsCategories"],
    "drivers": ["BusinessDrivers"],
    "nps": ["NetPromoter"],
    "industry": ["Industry", "IndustrySydney"],
}


def extract(path):
    c = sqlite3.connect(f"file:{Path(path).resolve()}?mode=ro", uri=True)
    with closing(c):
        return extract_connection(c, path)


def extract_connection(c, path):
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA query_only=ON")
    manifest = json.loads(
        c.execute("select document from archive_manifest").fetchone()[0]
    )
    questions = {}
    choices = collections.defaultdict(dict)
    for r in c.execute(
        "select q.*,st.SurveyTemplateID from SurveyQuestionTemplate q join SurveyStepTemplate st on st.ID=q.StepID"
    ):
        questions[r["ID"]] = dict(r)
    for r in c.execute(
        "select ID,OwnerID,Value,Label from SurveyQuestionValueTemplate"
    ):
        choices[r["OwnerID"]][str(r["ID"])] = str(r["Value"] or r["Label"] or "")
    allnames = {n for v in QUESTIONS.values() for n in v}
    qids = {i for i, q in questions.items() if q["Name"] in allnames}
    surveys = {
        r["ID"]: dict(r)
        for r in c.execute(
            "select ID,TemplateID,IsTest,State,IsMigrated,CreatedByID from Survey"
        )
    }
    entities = {
        r["ID"]: r["ParentID"]
        for r in c.execute("select ID,ParentID from EntitySurvey")
    }
    audit = collections.Counter()
    grouped = collections.defaultdict(set)
    for r in c.execute(
        "select a.QuestionID,a.Value,s.SurveyID,s.TemplateID as StepTemplateID from SurveyAnswer a join SurveyStep s on s.ID=a.StepID where a.Value is not null and trim(a.Value)!=''"
    ):
        if r["QuestionID"] not in qids:
            continue
        if questions[r["QuestionID"]]["StepID"] != r["StepTemplateID"]:
            audit["mismatchedStepAnswerRowsExcluded"] += 1
            continue
        key = (r["SurveyID"], r["QuestionID"])
        value = str(r["Value"]).strip()
        if value in grouped[key]:
            audit["identicalAnswerRowsCollapsed"] += 1
        grouped[key].add(value)
    years = []
    duplicates = collections.Counter(
        (s["TemplateID"], s["CreatedByID"])
        for i, s in surveys.items()
        if i not in entities and not s["IsTest"] and s["CreatedByID"]
    )
    for label, pid, did in EDITIONS:
        audit["ambiguousPersonalRecordsExcluded"] += sum(
            s["TemplateID"] == pid
            and not s["IsTest"]
            and bool(s["CreatedByID"])
            and duplicates[(pid, s["CreatedByID"])] > 1
            for i, s in surveys.items()
            if i not in entities
        )
        ids = [
            i
            for i, s in surveys.items()
            if s["TemplateID"] in (pid, did)
            and not s["IsTest"]
            and not (
                i not in entities
                and duplicates[(s["TemplateID"], s["CreatedByID"])] > 1
            )
            and (
                i not in entities
                or (entities[i] in surveys and not surveys[entities[i]]["IsTest"])
            )
        ]
        bymetric = {}
        questionmeta = {}
        for metric, names in QUESTIONS.items():
            tid = did if metric in ("stage", "cores", "paas", "workloads") else pid
            qs = [
                q
                for q in questions.values()
                if q["SurveyTemplateID"] == tid and q["Name"] in names
            ]
            if len(qs) != 1:
                bymetric[metric] = {}
                continue
            q = qs[0]
            qid = q["ID"]
            questionmeta[metric] = {
                "id": qid,
                "name": q["Name"],
                "type": q["ClassName"],
                "label": re.sub("<[^>]+>", "", q["Label"] or ""),
            }
            answers = {}
            for sid in ids:
                if surveys[sid]["TemplateID"] != tid:
                    continue
                vals = grouped.get((sid, qid), set())
                if len(vals) > 1:
                    audit["conflictingResponseQuestionsExcluded"] += 1
                    continue
                if not vals:
                    continue
                tokens = [token.strip() for token in next(iter(vals)).split(",")]
                if any(t not in choices[qid] for t in tokens):
                    audit["unmappedResponseQuestionsExcluded"] += 1
                    continue
                answers[sid] = [choices[qid][t] for t in tokens]
            bymetric[metric] = answers

        def stat(metric, predicate):
            rows = bymetric[metric]
            n = len(rows)
            k = sum(bool(predicate(v)) for v in rows.values())
            if n < 30 or k < 10 or n - k < 10:
                return {"n": n, "count": None, "pct": None}
            return {
                "n": n,
                "count": k,
                "pct": round(100 * k / n, 1),
                "completeN": sum(surveys[s]["State"] == "COMPLETE" for s in rows),
            }

        def large(v):
            return any(
                x
                in (
                    "10,000 to 99,999 cores",
                    "100,000 to 999,999 cores",
                    "1 million or more cores",
                )
                for x in v
            )

        metrics = {
            "production": stat(
                "stage", lambda v: any("production" in x.lower() for x in v)
            ),
            "large": stat("cores", large),
            "kubernetes": stat(
                "paas", lambda v: any("kubernetes" in x.lower() for x in v)
            ),
            "ai": stat("workloads", lambda v: any(x == "AI/ML" for x in v)),
            "research": stat(
                "workloads", lambda v: any("research computing" in x.lower() for x in v)
            ),
            "lockin": stat("drivers", lambda v: any("lock-in" in x.lower() for x in v)),
        }
        # Counts are deployment/response records, never presented as unique organizations.
        distributions = {}
        for metric in ["workloads", "drivers", "industry"]:
            counter = collections.Counter(
                x for v in bymetric[metric].values() for x in set(v)
            )
            n = len(bymetric[metric])
            distributions[metric] = {
                "n": n,
                "values": [
                    {"label": k, "count": v, "pct": round(v / n * 100, 1)}
                    for k, v in counter.most_common()
                    if v >= 10 and n - v >= 10
                ],
            }
        ratings = []
        for vals in bymetric["nps"].values():
            if len(vals) == 1 and vals[0].isdigit() and 0 <= int(vals[0]) <= 10:
                ratings.append(int(vals[0]))
        prom = sum(v >= 9 for v in ratings)
        det = sum(v <= 6 for v in ratings)
        nps = {
            "n": len(ratings),
            "score": (
                round(100 * (prom - det) / len(ratings), 1)
                if len(ratings) >= 30 and min(prom, det) >= 10
                else None
            ),
        }
        # Matched questions on the same deployment, without exporting deployment identifiers.
        paired = {
            s: v for s, v in bymetric["workloads"].items() if s in bymetric["cores"]
        }
        cross = []
        for islarge, title in [(False, "Under 10,000 cores"), (True, "10,000+ cores")]:
            population = [
                v for s, v in paired.items() if large(bymetric["cores"][s]) == islarge
            ]
            n = len(population)
            k = sum("AI/ML" in v for v in population)
            cross.append(
                {
                    "label": title,
                    "n": n,
                    "count": k if n >= 30 and min(k, n - k) >= 10 else None,
                    "pct": (
                        round(k / n * 100, 1)
                        if n >= 30 and min(k, n - k) >= 10
                        else None
                    ),
                }
            )
        years.append(
            {
                "year": label,
                "personalTemplate": pid,
                "deploymentTemplate": did,
                "personalRecords": sum(surveys[s]["TemplateID"] == pid for s in ids),
                "deploymentRecords": sum(surveys[s]["TemplateID"] == did for s in ids),
                "metrics": metrics,
                "distributions": distributions,
                "nps": nps,
                "migratedRecords": sum(bool(surveys[s]["IsMigrated"]) for s in ids),
                "scaleAi": cross,
                "questions": questionmeta,
            }
        )
    with open(path, "rb") as source:
        archive_hash = hashlib.file_digest(source, "sha256").hexdigest()
    return {
        "generatedAt": datetime.date.today().isoformat(),
        "snapshotCopiedAt": manifest["copied_at"],
        "archiveSha256": archive_hash,
        "audit": dict(audit),
        "years": years,
        "inventory": {
            t: manifest["tables"][t]["rows"]
            for t in [
                "Survey",
                "SurveyAnswer",
                "SurveyTemplate",
                "SurveyAnswerLog",
                "DeploymentSurvey",
                "Deployment",
            ]
        },
    }


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--archive", required=True)
    p.add_argument("--output", required=True)
    a = p.parse_args()
    result = extract(a.archive)
    Path(a.output).write_text(json.dumps(result, indent=2) + "\n")
    print(
        json.dumps(
            {
                "years": len(result["years"]),
                "audit": result["audit"],
                "metrics": [
                    {
                        "year": y["year"],
                        **{k: v["pct"] for k, v in y["metrics"].items()},
                        "nps": y["nps"]["score"],
                    }
                    for y in result["years"]
                ],
            }
        )
    )
