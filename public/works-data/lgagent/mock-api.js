(() => {
  const now = Date.now();
  const iso = (offsetMinutes) => new Date(now - offsetMinutes * 60_000).toISOString();

  const state = {
    sessions: [
      {
        id: "session_1",
        title: "运维诊断",
        created_at: iso(82),
        updated_at: iso(38),
        messages: [
          { id: "m1", role: "user", content: "生产环境的 Java 服务 CPU 突然升高，应该怎么排查？", created_at: iso(41) },
          {
            id: "m2",
            role: "assistant",
            content: "先确认负载来源，再定位线程栈和慢请求：\n\n1. `top -Hp <pid>` 找出高 CPU 线程\n2. `jstack <pid>` 分析 RUNNABLE 状态\n3. 检查 GC、慢 SQL 和下游超时\n4. 结合 APM 对比发布时间与流量变化",
            trace: [
              { id: "t1", label: "思考", text: "判断为运行时性能诊断问题" },
              { id: "t2", label: "行动", text: "调用 runbook_search 检索排查手册" }
            ],
            created_at: iso(40)
          }
        ]
      },
      {
        id: "session_2",
        title: "巡检报告解读",
        created_at: iso(320),
        updated_at: iso(260),
        messages: [
          { id: "m3", role: "user", content: "总结昨晚支付网关的告警趋势。", created_at: iso(260) },
          { id: "m4", role: "assistant", content: "00:20 到 01:40 出现 3 次连接池耗尽，均已自动恢复；建议调大最大连接数并增加队列监控。", created_at: iso(259) }
        ]
      }
    ],
    todos: [
      {
        id: 1, node_id: 101, project: "pay-gateway", server: "prod-pay-01", summary: "订单回调连续失败",
        ai_cause: "下游证书校验失败，重试后进入退避状态", level: "Critical",
        raw_log: "ERROR SslHandshakeException: PKIX path building failed\nat PaymentCallbackClient.invoke(...)",
        suggestion: "更新信任证书并清空失败重试队列，再观察 5 分钟。",
        status: "pending", feedback: "none", created_at: iso(24)
      },
      {
        id: 2, node_id: 102, project: "search-service", server: "prod-search-02", summary: "索引写入延迟升高",
        ai_cause: "Qdrant 合并压力较高，写入队列堆积", level: "High",
        raw_log: "WARN BulkIndexQueue: queue_size=820 latency=1820ms",
        suggestion: "临时降低写入并发，扩大刷新间隔后继续监控。",
        status: "pending", feedback: "none", created_at: iso(91)
      },
      {
        id: 3, node_id: 103, project: "auth-api", server: "prod-auth-03", summary: "登录接口出现慢查询",
        ai_cause: "用户角色 JOIN 查询缺少热数据缓存", level: "Medium",
        raw_log: "INFO QueryTooSlow: duration=1240ms route=/api/login",
        suggestion: "为角色权限增加短 TTL 缓存，并补齐查询索引。",
        status: "pending", feedback: "none", created_at: iso(150)
      }
    ],
    tasks: [
      { id: 1, title: "修复支付回调证书链", details: "更新信任证书并验证失败队列重放", source: "llm", priority: "High", status: "pending", created_at: iso(25), updated_at: iso(24) },
      { id: 2, title: "优化向量库刷新策略", details: "评估写入延迟和查询 QPS 后调整 refresh interval", source: "ops", priority: "Medium", status: "pending", created_at: iso(90), updated_at: iso(88) },
      { id: 3, title: "输出本周巡检报告", details: "汇总可用性、告警、容量与变更记录", source: "manual", priority: "Low", status: "done", created_at: iso(300), updated_at: iso(120) }
    ],
    nodes: [
      { id: 101, name: "prod-pay-01", type: "ssh", host: "10.20.8.11", port: 22, username: "ops", target: "/var/log/app/pay.log", status: "connected", description: "支付网关生产节点" },
      { id: 102, name: "prod-search-02", type: "ssh", host: "10.20.8.12", port: 22, username: "ops", target: "/var/log/app/search.log", status: "monitoring", description: "搜索与向量服务节点" },
      { id: 103, name: "prod-auth-03", type: "ssh", host: "10.20.8.13", port: 22, username: "ops", target: "/var/log/app/auth.log", status: "connected", description: "认证服务节点" }
    ],
    documents: [
      { filename: "runbook-overview.md", relative_path: "documents/runbook-overview.md", size_bytes: 2840, suffix: ".md", updated_at: iso(320) },
      { filename: "incident-handbook.md", relative_path: "documents/incident-handbook.md", size_bytes: 3620, suffix: ".md", updated_at: iso(180) }
    ],
    contents: {
      "runbook-overview.md": "# 运维手册\n\n## CPU 升高\n\n1. 定位进程与线程\n2. 检查 GC 与线程栈\n3. 对比最近发布\n\n## 日志异常\n\n- 先确认错误类型\n- 再执行对应的处置动作。",
      "incident-handbook.md": "# 故障处置\n\n## 支付回调\n\n检查证书、DNS、重试队列与下游延迟。\n\n## 搜索服务\n\n关注队列长度、索引延迟与合并压力。"
    },
    tools: [
      { name: "run_command", enabled: true, description: "在授权节点执行诊断命令", source_type: "system", source_name: null, path: null, method: null },
      { name: "search_document", enabled: true, description: "检索知识库中的处置文档", source_type: "system", source_name: null, path: null, method: null },
      { name: "create_todo_card", enabled: true, description: "生成需人工确认的故障处理卡片", source_type: "system", source_name: null, path: null, method: null },
      { name: "query_openapi_status", enabled: false, description: "查询外部服务健康状态", source_type: "external", source_name: "ops-openapi", openapi_url: "https://ops.example.com/openapi.json", server_url: "https://ops.example.com", path: "/status", method: "GET", operation_id: "queryStatus" }
    ],
    next: { todo: 4, task: 4, node: 104, session: 3, message: 5 }
  };

  const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 220 + Math.random() * 260));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const json = (data) => Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }));

  async function request(path, options = {}) {
    const url = new URL(path, location.origin);
    const route = `${url.pathname}${url.search}`;
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;

    if (method === "GET" && route === "/chat/sessions") return json(clone(state.sessions));
    if (method === "POST" && route === "/chat/sessions") {
      const item = { id: `session_${state.next.session++}`, title: body.title || "新对话", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), messages: [] };
      state.sessions.unshift(item);
      return json(clone(item));
    }
    if (method === "GET" && route.startsWith("/chat/sessions/")) {
      const id = decodeURIComponent(url.pathname.split("/").pop());
      return json(clone(state.sessions.find((item) => item.id === id) || { id, title: "对话", messages: [] }));
    }
    if (method === "GET" && route === "/todos/") return json(clone(state.todos.filter((item) => item.status === "pending")));
    if (method === "PUT" && /^\/todos\/\d+\/status$/.test(route)) {
      const id = Number(url.pathname.split("/")[2]);
      const item = state.todos.find((card) => card.id === id);
      if (item) item.status = body.status || "resolved";
      return json({ message: "status updated" });
    }
    if (method === "PUT" && /^\/todos\/\d+\/feedback$/.test(route)) {
      const id = Number(url.pathname.split("/")[2]);
      const item = state.todos.find((card) => card.id === id);
      if (item) item.feedback = body.feedback || "none";
      return json({ message: "feedback saved" });
    }
    if (method === "DELETE" && /^\/todos\/\d+$/.test(route)) {
      const id = Number(url.pathname.split("/")[2]);
      state.todos = state.todos.filter((item) => item.id !== id);
      return json({ message: "deleted" });
    }
    if (method === "GET" && route === "/task-list/") return json(clone(state.tasks));
    if (method === "PUT" && /^\/task-list\/\d+$/.test(route)) {
      const id = Number(url.pathname.split("/")[2]);
      const item = state.tasks.find((task) => task.id === id);
      if (item) Object.assign(item, body, { updated_at: new Date().toISOString() });
      return json(clone(item));
    }
    if (method === "DELETE" && /^\/task-list\/\d+$/.test(route)) {
      const id = Number(url.pathname.split("/")[2]);
      state.tasks = state.tasks.filter((item) => item.id !== id);
      return json({ message: "deleted" });
    }
    if (method === "GET" && route === "/servers/nodes") return json(clone(state.nodes));
    if (method === "GET" && /^\/servers\/nodes\/\d+\/agent-events$/.test(route)) {
      const id = Number(url.pathname.split("/")[3]);
      return json(clone(state.nodes.find((node) => node.id === id) || {}));
    }
    if (method === "GET" && route === "/knowledge/documents") return json({ documents: clone(state.documents) });
    if (method === "GET" && route === "/knowledge/status") return json({ status: { collection_name: "lgagent-knowledge", points_count: 48 } });
    if (method === "GET" && route.startsWith("/knowledge/documents/")) {
      const filename = decodeURIComponent(url.pathname.split("/").pop());
      const document = state.documents.find((item) => item.filename === filename);
      return json({ document: clone(document), content: state.contents[filename] || "" });
    }
    if (method === "GET" && route === "/api/tools/") return json(clone(state.tools));
    if (method === "PUT" && route.startsWith("/api/tools/")) {
      const name = decodeURIComponent(url.pathname.split("/").pop());
      const item = state.tools.find((tool) => tool.name === name);
      if (item) item.enabled = Boolean(body.enabled);
      return json({ message: "updated" });
    }
    if (method === "DELETE" && route.startsWith("/api/tools/")) {
      const name = decodeURIComponent(url.pathname.split("/").pop());
      state.tools = state.tools.filter((tool) => tool.name !== name);
      return json({ message: "deleted" });
    }
    return new Response(JSON.stringify({ detail: `API endpoint not implemented: ${method} ${route}` }), { status: 404 });
  }

  function createChatStream({ sessionId, content }) {
    const encoder = new TextEncoder();
    let controller;
    const stream = new ReadableStream({
      start(streamController) {
        controller = streamController;
        const send = (event, data) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        const message = { id: `m${state.next.message++}`, role: "user", content, created_at: new Date().toISOString() };
        const session = state.sessions.find((item) => item.id === sessionId);
        if (session) session.messages.push(message);
        send("status", { status: "running", message: "Agent 已启动" });
        send("step", { message: "分析问题类型" });
        setTimeout(() => send("tool_call", { tool_name: "search_document", tool_args: { query: content } }), 450);
        setTimeout(() => send("tool_result", { tool_name: "search_document", content: "已从知识库匹配 2 条相关处置记录。" }), 850);
        setTimeout(() => {
          const answer = "已根据当前运维上下文生成分析结果：\n\n1. 先确认关键指标与最近变更\n2. 根据错误日志选择处置步骤\n3. 若无法自动修复，会生成待处理卡片。\n\n```bash\ntail -n 200 /var/log/app/service.log\n```";
          const assistant = { id: `m${state.next.message++}`, role: "assistant", content: answer, trace: [], created_at: new Date().toISOString() };
          if (session) session.messages.push(answer ? { ...assistant, created_at: assistant.created_at } : answer);
          send("final", { content: answer });
          send("status", { status: "finished", message: "Agent 已结束" });
          controller.close();
        }, 1250);
      },
      cancel() { try { controller?.close(); } catch {} }
    });
    return new Response(stream, { status: 200, headers: { "Content-Type": "text/event-stream" } });
  }

  window.LGAgentMockApi = {
    enabled: true,
    request,
    createChatStream,
    delay: () => delay(null)
  };
})();
