import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const response = `您好！我是电池适航标准智能搜索引擎。

关于您的问题，本系统支持检索五大领域标准：
- 储能系统（储能电池安全标准）
- 汽车动力（动力电池测试标准）
- 消费电子（便携式电池标准）
- 航空航天（机载电池适航标准）
- 轨道交通（铁路电池标准）

请输入您想查询的具体问题！`;

      for (let i = 0; i < response.length; i += 3) {
        const chunk = response.slice(i, i + 3);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: chunk })}\n`));
        await new Promise(r => setTimeout(r, 20));
      }
      
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: [] })}\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
