// Approved navigator presentation changes. Service snapshots and historical
// release membership remain untouched; detail URLs keep their service identity.
export function navigatorCatalog(source) {
  const catalog = structuredClone(source);
  const core = catalog.find(row => row.category.slug === 'openstack-components');
  const addons = core?.subcategories.find(row => row.category.slug === 'add-ons-to-services');
  const services = core?.subcategories.find(row => row.category.slug === 'openstack-services');
  const storage = services?.subcategories.find(row => row.category.slug === 'storage');
  const storlets = addons?.subcategories.flatMap(row => row.components).find(row => row.code_name.toLowerCase() === 'storlets');
  if (storage && storlets) {
    storage.components = storage.components.filter(row => row.id !== storlets.id);
    storage.components.splice(storage.components.findIndex(row => row.code_name.toLowerCase() === 'swift') + 1, 0, storlets);
    storage.components.forEach((row,index) => { row.order = index + 1; });
    for (const group of addons.subcategories) group.components = group.components.filter(row => row.id !== storlets.id);
    addons.subcategories = addons.subcategories.filter(row => row.components.length);
    if (!addons.subcategories.length && !addons.components.length) core.subcategories = core.subcategories.filter(row => row !== addons);
  }
  const deploy = catalog.find(row => row.category.slug === 'deployment-tools');
  const lifecycle = deploy?.subcategories.find(row => row.category.slug === 'lifecycle-management');
  const framework = lifecycle?.subcategories.find(row => row.category.slug === 'frameworks-for-lifecycle-management');
  const packaging = lifecycle?.subcategories.find(row => row.category.slug === 'packaging-recipes-for-popular-frameworks');
  if (framework && packaging) {
    const puppet = packaging.components.find(row => row.code_name.toLowerCase() === 'puppet-openstack');
    if (puppet) framework.components.push(puppet);
    lifecycle.subcategories = lifecycle.subcategories.filter(row => row !== packaging);
    framework.category.name = framework.category.label = 'Frameworks for Deployment and Lifecycle Management';
    deploy.category.description = 'Frameworks for deployment and lifecycle management of OpenStack.';
    const kolla = framework.components.find(row => row.code_name.toLowerCase() === 'kolla-ansible');
    const ansible = framework.components.find(row => row.code_name.toLowerCase() === 'openstack-ansible');
    if (kolla && ansible) { ansible.description = kolla.description; ansible.name = kolla.name; }
    const bifrost = framework.components.find(row => row.code_name.toLowerCase() === 'bifrost');
    if (bifrost) bifrost.description = bifrost.name = 'Ansible playbooks to deploy standalone Ironic';
    const rank = row => ['kolla-ansible', 'openstack-ansible'].indexOf(row.code_name.toLowerCase());
    framework.components.sort((a,b) => (rank(a) < 0 ? 2 : rank(a)) - (rank(b) < 0 ? 2 : rank(b)));
    framework.components.forEach((row,index) => { row.order = index + 1; });
  }
  return catalog;
}
