import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const response = `您好！我是电池适航标准智能搜索引擎。

支持检索五大领域电池标准：
• 储能系统标准
• 汽车动力电池标准
• 消费电子标准
• 航空航天标准
• 轨道交通标准

请输入您想查询的问题！`;

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
