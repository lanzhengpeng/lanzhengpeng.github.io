(() => {
  const MODULES = [
    { name: 'agent_demo_module', prefix: 'AgentDemo', base: '/api/agent_demos' },
    { name: 'agent_module', prefix: 'Agent', base: '/api/agents' },
    { name: 'alpha_module', prefix: 'Alpha', base: '/api/alphas' },
    { name: 'beta_module', prefix: 'Beta', base: '/api/betas' },
    { name: 'comment_module', prefix: 'Comment', base: '/api/comments' },
    { name: 'direct_verify_module', prefix: 'Direct', base: '/api/directs' },
    { name: 'gamma_module', prefix: 'Gamma', base: '/api/gammas' },
    { name: 'order_module', prefix: 'Order', base: '/api/orders' },
    { name: 'paas_langserve_verify_module', prefix: 'PaasLangserveVerify', base: '/api/paas_langserve_verifies' },
    { name: 'product_module', prefix: 'Product', base: '/api/products' },
    { name: 'test_langserve_module', prefix: 'Item', base: '/api/items' },
    { name: 'user_module', prefix: 'User', base: '/api/users' },
  ];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function buildModule(module) {
    const entity = module.prefix.toLowerCase();
    const callGraph = {
      controller: [`${module.prefix}Controller(${module.prefix}Service)`],
      service: [`${module.prefix}Service(${module.prefix}Mapper)`],
      mapper: [`${module.prefix}Mapper(None)`],
    };
    const apiMap = [
      { module: module.name, method: 'POST', path: `${module.base}/`, handler: `${module.prefix}Controller.create${module.prefix}` },
      { module: module.name, method: 'GET', path: `${module.base}/{id}`, handler: `${module.prefix}Controller.get${module.prefix}` },
      { module: module.name, method: 'GET', path: `${module.base}/`, handler: `${module.prefix}Controller.list${module.prefix}s` },
    ];
    const components = ['controller', 'service', 'mapper'].map((type) => ({
      module: module.name,
      type,
      name: `${module.prefix}${type[0].toUpperCase()}${type.slice(1)}`,
      methods: type === 'mapper'
        ? [
            { name: 'create', feature: `创建${entity}`, calls: [] },
            { name: 'get', feature: `查询${entity}`, calls: [] },
            { name: 'list', feature: `查询${entity}列表`, calls: [] },
          ]
        : [
            { name: `create${module.prefix}`, feature: `创建${entity}`, calls: [`${module.prefix}Mapper.create`] },
            { name: `get${module.prefix}`, feature: `查询${entity}`, calls: [`${module.prefix}Mapper.get`] },
            { name: `list${module.prefix}s`, feature: `查询${entity}列表`, calls: [`${module.prefix}Mapper.list`] },
          ],
    }));
    return { callGraph, apiMap, components };
  }

  function createResponse() {
    const callGraph = {};
    const apiMap = [];
    const components = [];
    for (const module of MODULES) {
      const built = buildModule(module);
      callGraph[module.name] = built.callGraph;
      apiMap.push(...built.apiMap);
      components.push(...built.components);
    }
    return {
      status: 'ok',
      source: 'mock-api',
      modules: { loaded: MODULES.map((item) => item.name), failed: [] },
      counts: { controllers: MODULES.length, services: MODULES.length, mappers: MODULES.length },
      callGraph,
      apiMap,
      components,
    };
  }

  function deriveModuleName(prompt) {
    const map = [
      ['发票', 'invoice'], ['用户', 'user'], ['订单', 'order'], ['商品', 'product'],
      ['库存', 'inventory'], ['支付', 'payment'], ['通知', 'notification'], ['日志', 'log'],
      ['报表', 'report'], ['评论', 'comment'],
    ];
    const matched = map.find(([keyword]) => prompt.includes(keyword));
    const suffix = matched ? matched[1] : `generated_${Date.now().toString().slice(-4)}`;
    return `${suffix}_module`;
  }

  const state = createResponse();

  window.PaaSMockApi = {
    async get(path) {
      await wait(path === '/admin/kernel/cheat-sheet' ? 240 : 120);
      if (path === '/health') return { status: 'ok', source: 'mock-api' };
      if (path === '/admin/kernel/cheat-sheet') return clone(state);
      const error = new Error(`Mock API 404: ${path}`);
      error.status = 404;
      throw error;
    },

    async post(path, body = {}) {
      await wait(520);
      if (path !== '/admin/agent/generate-module') {
        const error = new Error(`Mock API 404: ${path}`);
        error.status = 404;
        throw error;
      }

      const prompt = String(body.prompt || '');
      const name = deriveModuleName(prompt);
      const prefix = name.replace(/_module$/, '').replace(/(^|_)(\w)/g, (_, __, letter) => letter.toUpperCase());
      const module = { name, prefix, base: `/api/${prefix.toLowerCase()}s` };

      if (!state.modules.loaded.includes(name)) {
        const built = buildModule(module);
        state.modules.loaded.push(name);
        state.counts.controllers += 1;
        state.counts.services += 1;
        state.counts.mappers += 1;
        state.callGraph[name] = built.callGraph;
        state.apiMap.push(...built.apiMap);
        state.components.push(...built.components);
      }

      return {
        status: 'ok',
        module: name,
        files: ['Controller.java', 'Service.java', 'Mapper.java'],
        deployTime: '1.2s',
        apiCount: 3,
      };
    },
  };
})();
