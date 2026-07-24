export const i18n = {
    en: {
        name: "Zhengpeng Lan",
        heroIntro: "M.S. in Software Engineering, Zhejiang Normal University · Agent Framework Researcher",
        navPub: "Publication",
        aboutTitle: "About Me",
        aboutText: "I am Zhengpeng Lan, a master's student in Software Engineering at Zhejiang Normal University, and an agent framework researcher. My research centers on LLM agents, tool learning, and latent-space verification, with the goal of building more robust and reliable autonomous systems.",
        pubTitle: "Selected Publication",
        downloadBtn: "Download PDF",
        viewSpringer: "View on Springer",
        lastUpdated: "Last updated: ",
        skillsTitle: "Skills",
        skills: [
            "Java",
            "Spring Boot",
            "Agent Development",
            "LangGraph",
            "Python",
            "PyTorch",
            "LLM",
            "ReAct"
        ],
        phrases: [
            "LLM Agent Researcher",
            "Tool Learning Researcher",
            "Open Source Contributor"
        ],
        abstractText: `Large Language Models (LLMs) exhibit promising capabilities as autonomous agents within the ReAct framework, yet they remain vulnerable to cascading errors in multi-step tool invocation scenarios. While introducing a lightweight verifier offers a natural mitigation strategy, we observe that end-to-end textual judgments from such verifiers are often unstable and unreliable. In this paper, we propose LatentReAct, a latent-space verification framework that enhances ReAct agents through decompositional representation validation. Instead of relying on generated text, LatentReAct extracts intermediate-layer latent representations from a frozen 3B-parameter model and decomposes action evaluation into multiple semantic dimensions. A lightweight policy head then scores candidate actions based on these latent features. Experiments on ToolBench and BFCL v4 demonstrate that LatentReAct significantly outperforms strong baselines, achieving 74.47% verification accuracy on ToolBench, improving end-to-end execution accuracy by up to 5 percentage points, and reducing unnecessary reasoning steps by 12–16%.`
    },
    zh: {
        name: "兰政鹏",
        heroIntro: "浙江师范大学 · 软件工程硕士 · 智能体框架研究者",
        navPub: "论文",
        aboutTitle: "关于我",
        aboutText: "我是兰政鹏，浙江师范大学软件工程专业硕士研究生，智能体框架研究者。我的研究聚焦于大模型智能体、工具学习与隐空间验证，致力于构建更稳健、更可靠的自主系统。",
        pubTitle: "代表性论文",
        downloadBtn: "下载 PDF",
        viewSpringer: "Springer 查看",
        lastUpdated: "最近更新：",
        skillsTitle: "技能",
        skills: [
            "Java",
            "Spring Boot",
            "智能体开发",
            "LangGraph",
            "Python",
            "PyTorch",
            "大语言模型",
            "ReAct"
        ],
        phrases: [
            "大模型智能体研究者",
            "工具学习研究者",
            "开源贡献者"
        ],
        abstractText: `大语言模型（LLM）在 ReAct 框架下展现出作为自主智能体的广阔前景，但在多步工具调用场景中仍容易受到错误级联的影响。引入轻量级验证器是一种自然的缓解策略，但我们发现这类验证器的端到端文本判断往往不稳定且不可靠。为此，本文提出 LatentReAct，一种基于隐空间的验证框架，通过分解式表示验证来增强 ReAct 智能体。LatentReAct 不再依赖生成的文本，而是从冻结的30亿参数模型中提取中间层隐表示，并将动作评估分解为多个语义维度，再由轻量级策略头基于这些隐特征为候选动作打分。在 ToolBench 与 BFCL v4 上的实验表明，LatentReAct 显著优于强基线方法：在 ToolBench 上验证准确率达 74.47%，端到端执行准确率提升最高5个百分点，并将不必要的推理步骤减少 12–16%。`
    }
};
