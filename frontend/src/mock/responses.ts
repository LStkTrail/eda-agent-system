const responses: string[] = [
  `这是一个很好的问题！让我为你详细解答。

**核心概念：**
在EDA设计流程中，这个问题涉及到多个层面的考量。

首先，我们需要理解基本的设计约束：
- 时序约束是最关键的设计参数
- 面积和功耗需要在架构阶段就开始规划
- 可测试性设计（DFT）应该贯穿整个设计流程

\`\`\`verilog
module example (
  input  wire clk,
  input  wire rst_n,
  input  wire [7:0] data_in,
  output reg  [7:0] data_out
);

always @(posedge clk or negedge rst_n) begin
  if (!rst_n)
    data_out <= 8'b0;
  else
    data_out <= data_in;
end

endmodule
\`\`\`

**总结：**
掌握这些基础知识对于后续的高级设计非常重要。建议从简单的模块开始练习，逐步构建更复杂的系统。`,

  `好的，我来帮你分析这个问题。

**关于时序分析：**

静态时序分析（STA）是验证芯片时序性能的重要方法。主要检查以下几个方面：

1. **Setup检查** — 确保数据在时钟边沿前稳定
2. **Hold检查** — 确保数据在时钟边沿后持续稳定
3. **Recovery/Removal** — 异步信号的时序要求

\`\`\`tcl
# PrimeTime 基本命令
read_verilog netlist.v
read_sdc constraints.sdc
report_timing -max_paths 10
report_timing -delay_type min
\`\`\`

**常见时序违例修复方法：**
- Setup violation: 优化关键路径逻辑级数
- Hold violation: 插入buffer/delay cell
- 时钟偏差问题: 优化时钟树（CTS）

希望这个解释对你有帮助！如果有其他问题请继续提问。`,

  `让我为你介绍一下相关内容。

**设计要点：**

在现代芯片设计中，我们通常需要考虑以下几个关键因素：

| 指标 | 描述 | 优先级 |
|------|------|--------|
| 性能 | 最高工作频率 | 高 |
| 面积 | 门数/晶体管数量 | 中 |
| 功耗 | 动态+静态功耗 | 高 |
| 可靠性 | MTBF指标 | 中 |

**最佳实践建议：**

- 使用参数化的RTL编码风格，提高代码复用性
- 在设计初期就建立完善的验证环境
- 采用层次化的设计方法，将复杂系统分解为可管理的模块
- 充分利用EDA工具的自动化能力

\`\`\`verilog
// 参数化设计示例
module fifo #(
  parameter DATA_WIDTH = 8,
  parameter DEPTH      = 16
)(
  input  wire                  clk,
  input  wire                  rst_n,
  input  wire                  wr_en,
  input  wire                  rd_en,
  input  wire [DATA_WIDTH-1:0] din,
  output wire [DATA_WIDTH-1:0] dout,
  output wire                  full,
  output wire                  empty
);
  // FIFO implementation
endmodule
\`\`\`

如果需要更具体的内容，请告诉我！`,

  `这个话题非常重要，让我详细说明一下。

**工艺节点选择：**

不同的工艺节点有不同的特性：
- **28nm** — 成熟节点，性价比高
- **14nm/16nm** — FinFET工艺，性能提升明显
- **7nm/5nm** — 先进节点，高性能低功耗
- **3nm** — 最新节点，极致性能

**设计挑战随工艺缩小：**

1. 短沟道效应加剧
2. 漏电流增大
3. 工艺偏差（Process Variation）影响增大
4. 多重曝光（Multi-Patterning）增加设计复杂度
5. 电迁移和可靠性问题

每一代工艺都需要新的设计方法和EDA工具支持。现代EDA工具正在利用AI/ML技术来辅助设计优化。`,

  `这是EDA领域的一个经典问题。

**验证方法学概述：**

现代IC验证主要采用以下方法学：

**1. UVM (Universal Verification Methodology)**
- 基于SystemVerilog的标准化验证框架
- 支持约束随机验证
- 覆盖率驱动的验证策略

**2. Formal Verification（形式验证）**
- 数学方法证明设计正确性
- 等价性检查（Equivalence Checking）
- 模型检查（Model Checking）
- 属性验证（Property Checking）

**3. Emulation & Prototyping**
- 硬件加速仿真
- FPGA原型验证
- 适用于大规模SoC验证

\`\`\`systemverilog
class my_test extends uvm_test;
  \`uvm_component_utils(my_test)
  
  function new(string name, uvm_component parent);
    super.new(name, parent);
  endfunction
  
  task run_phase(uvm_phase phase);
    phase.raise_objection(this);
    // Test sequence
    #1000;
    phase.drop_objection(this);
  endtask
endclass
\`\`\`

验证占据了芯片开发周期的60-70%，是确保芯片首次流片成功的关键。`,

  `很好的问题！让我来解答。

**低功耗设计技术：**

在当今的移动和IoT时代，功耗优化是芯片设计的核心挑战之一。

**动态功耗优化：**
- 时钟门控（Clock Gating）— 最有效的动态功耗优化手段
- 操作数隔离（Operand Isolation）
- 多电压域设计（Multi-Vdd）

**静态功耗优化：**
- 多阈值电压（Multi-Vt）单元库
- 电源门控（Power Gating）
- 体偏压技术（Body Biasing）

\`\`\`verilog
// 时钟门控示例
wire gated_clk;
assign gated_clk = clk & enable;

// 更安全的实现（使用ICG单元）
// EDA工具会自动插入集成时钟门控单元
\`\`\`

**UPF/CPF：**
使用统一功耗格式（UPF）描述功耗意图，EDA工具据此自动实现功耗管理结构。

功耗优化需要在架构、RTL、综合、布局各个阶段协同进行。`,
]

export function getRandomResponse(): string {
  return responses[Math.floor(Math.random() * responses.length)]
}

export function matchResponse(input: string): string {
  const lower = input.toLowerCase()
  const keywords: [string[], number][] = [
    [['verilog', '触发器', 'rtl', '模块', '寄存器'], 0],
    [['时序', 'sta', 'setup', 'hold', 'timing', '分析'], 1],
    [['设计', '流程', '方法', '架构', '规划'], 2],
    [['工艺', '节点', 'nm', 'finfet', '制程'], 3],
    [['验证', 'uvm', 'formal', '仿真', '测试'], 4],
    [['功耗', 'power', '低功耗', '时钟门控', '电压'], 5],
  ]

  for (const [keys, index] of keywords) {
    if (keys.some(k => lower.includes(k))) {
      return responses[index]
    }
  }

  return getRandomResponse()
}

export default responses
