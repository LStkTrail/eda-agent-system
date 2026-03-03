import type { Session } from '@/types'

const now = Date.now()
const hour = 3600000
const day = 86400000

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    title: 'Verilog D触发器实现',
    createdAt: now - 2 * hour,
    updatedAt: now - 2 * hour,
    messageCount: 4,
    preview: '如何用Verilog实现一个带异步复位的D触发器？',
    messages: [
      { id: 'm1-1', role: 'user', content: '如何用Verilog实现一个带异步复位的D触发器？', timestamp: now - 2 * hour },
      { id: 'm1-2', role: 'assistant', content: '以下是一个带异步复位的D触发器Verilog实现：\n\n```verilog\nmodule d_ff_async_rst (\n  input  wire clk,\n  input  wire rst_n,\n  input  wire d,\n  output reg  q\n);\n\nalways @(posedge clk or negedge rst_n) begin\n  if (!rst_n)\n    q <= 1\'b0;\n  else\n    q <= d;\nend\n\nendmodule\n```\n\n**关键要点：**\n- `posedge clk` 表示时钟上升沿触发\n- `negedge rst_n` 表示异步低电平复位\n- 复位优先级高于正常赋值', timestamp: now - 2 * hour + 5000 },
      { id: 'm1-3', role: 'user', content: '那如果要加上使能信号呢？', timestamp: now - 2 * hour + 60000 },
      { id: 'm1-4', role: 'assistant', content: '加入使能信号的D触发器：\n\n```verilog\nmodule d_ff_en (\n  input  wire clk,\n  input  wire rst_n,\n  input  wire en,\n  input  wire d,\n  output reg  q\n);\n\nalways @(posedge clk or negedge rst_n) begin\n  if (!rst_n)\n    q <= 1\'b0;\n  else if (en)\n    q <= d;\n  // else: q keeps its value\nend\n\nendmodule\n```\n\n当 `en=1` 时，数据在时钟边沿被锁存；当 `en=0` 时，输出保持不变。', timestamp: now - 2 * hour + 65000 },
    ],
  },
  {
    id: 'session-2',
    title: 'Design Compiler综合脚本',
    createdAt: now - 1 * day,
    updatedAt: now - 1 * day,
    messageCount: 2,
    preview: 'Synopsys DC的基本综合流程是什么？',
    messages: [
      { id: 'm2-1', role: 'user', content: 'Synopsys DC的基本综合流程是什么？', timestamp: now - 1 * day },
      { id: 'm2-2', role: 'assistant', content: 'Synopsys Design Compiler 的基本综合流程如下：\n\n**1. 环境设置**\n- 设置 `search_path`（库文件路径）\n- 指定 `target_library` 和 `link_library`\n\n**2. 读入设计**\n```tcl\nread_verilog rtl/top.v\ncurrent_design top\nlink\n```\n\n**3. 施加约束**\n```tcl\ncreate_clock -period 10 [get_ports clk]\nset_input_delay 2 -clock clk [all_inputs]\nset_output_delay 2 -clock clk [all_outputs]\n```\n\n**4. 综合编译**\n```tcl\ncompile_ultra\n```\n\n**5. 检查与输出**\n```tcl\nreport_timing\nreport_area\nwrite -format verilog -output netlist/top.v\nwrite_sdc output/top.sdc\n```', timestamp: now - 1 * day + 5000 },
    ],
  },
  {
    id: 'session-3',
    title: 'STA时序分析基础',
    createdAt: now - 2 * day,
    updatedAt: now - 2 * day,
    messageCount: 2,
    preview: '什么是Setup Time和Hold Time？',
    messages: [
      { id: 'm3-1', role: 'user', content: '什么是Setup Time和Hold Time？', timestamp: now - 2 * day },
      { id: 'm3-2', role: 'assistant', content: '**Setup Time（建立时间）**\n数据信号必须在时钟有效边沿到来**之前**保持稳定的最小时间。\n\n**Hold Time（保持时间）**\n数据信号必须在时钟有效边沿到来**之后**继续保持稳定的最小时间。\n\n**违例影响：**\n- Setup violation → 降低时钟频率可修复\n- Hold violation → 与频率无关，必须通过插入延迟单元修复\n\n```\n        Setup     Hold\n        Time      Time\n  ←─────┤    ├────→\n  ──────┼────┼──────── Data\n        │ CLK│\n        │ ↑  │\n```\n\n在STA工具（如PrimeTime）中，通常用 `report_timing` 命令查看这两种时序裕量。', timestamp: now - 2 * day + 5000 },
    ],
  },
  {
    id: 'session-4',
    title: 'FPGA开发调试技巧',
    createdAt: now - 3 * day,
    updatedAt: now - 3 * day,
    messageCount: 2,
    preview: 'FPGA调试有哪些常用方法？',
    messages: [
      { id: 'm4-1', role: 'user', content: 'FPGA调试有哪些常用方法？', timestamp: now - 3 * day },
      { id: 'm4-2', role: 'assistant', content: '**常用FPGA调试方法：**\n\n1. **仿真验证** — 使用ModelSim/VCS进行功能仿真\n2. **ILA（Integrated Logic Analyzer）** — Xilinx内置逻辑分析仪，实时采集信号\n3. **VIO（Virtual I/O）** — 虚拟输入输出，动态控制/观测信号\n4. **UART打印** — 通过串口输出调试信息\n5. **LED指示** — 最基础的状态指示方法\n6. **SignalTap** — Intel/Altera的嵌入式逻辑分析仪\n\n**调试最佳实践：**\n- 先仿真后上板，减少调试时间\n- 设计时预留调试端口\n- 使用 `(* mark_debug = "true" *)` 标记关键信号', timestamp: now - 3 * day + 5000 },
    ],
  },
  {
    id: 'session-5',
    title: 'RTL到GDSII流程',
    createdAt: now - 5 * day,
    updatedAt: now - 5 * day,
    messageCount: 2,
    preview: '芯片设计从RTL到GDSII的完整流程？',
    messages: [
      { id: 'm5-1', role: 'user', content: '芯片设计从RTL到GDSII的完整流程？', timestamp: now - 5 * day },
      { id: 'm5-2', role: 'assistant', content: '**RTL → GDSII 完整流程：**\n\n1. **RTL设计** → Verilog/VHDL编码\n2. **功能仿真** → ModelSim/VCS验证逻辑正确性\n3. **逻辑综合** → Design Compiler → 门级网表\n4. **DFT插入** → 扫描链、BIST等可测试性设计\n5. **形式验证** → Formality确认综合等价性\n6. **布局规划** → Floorplanning确定模块位置\n7. **布局布线** → Innovus/ICC2完成Place & Route\n8. **时钟树综合** → CTS平衡时钟偏差\n9. **STA签核** → PrimeTime时序分析\n10. **物理验证** → DRC/LVS/ERC检查\n11. **GDSII输出** → 最终版图数据交付Foundry\n\n每个步骤都有迭代优化的过程。', timestamp: now - 5 * day + 5000 },
    ],
  },
  {
    id: 'session-6',
    title: 'PCB走线规则',
    createdAt: now - 7 * day,
    updatedAt: now - 7 * day,
    messageCount: 2,
    preview: 'PCB高速信号走线有哪些注意事项？',
    messages: [
      { id: 'm6-1', role: 'user', content: 'PCB高速信号走线有哪些注意事项？', timestamp: now - 7 * day },
      { id: 'm6-2', role: 'assistant', content: '**PCB高速信号走线注意事项：**\n\n**阻抗匹配**\n- 单端信号通常50Ω\n- 差分信号通常100Ω\n- 使用阻抗计算器确定线宽/间距\n\n**走线规则**\n- 避免直角走线（用45°或圆弧）\n- 差分对等长匹配\n- 关键信号避免跨越分割平面\n- 高速信号远离板边和连接器\n\n**EMI抑制**\n- 电源/地平面完整\n- 去耦电容靠近芯片放置\n- 信号回流路径最短\n\n**串扰控制**\n- 3W原则：走线间距 ≥ 3倍线宽\n- 敏感信号使用地线隔离', timestamp: now - 7 * day + 5000 },
    ],
  },
]
