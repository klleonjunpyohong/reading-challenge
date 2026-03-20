import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { books, completedCount, challengeType } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    // If no API key, return simulated response
    if (!apiKey) {
      const completedBooks = books.filter((b: any) => b.status === 'completed');
      const categories = completedBooks.map((b: any) => b.category);
      const topCat = categories.sort((a: string, b: string) =>
        categories.filter((c: string) => c === b).length - categories.filter((c: string) => c === a).length
      )[0] || '자기계발';

      return NextResponse.json({
        growth_summary: `${completedCount}권의 독서를 통해 ${topCat} 분야에서 깊이 있는 통찰을 쌓아가고 있습니다.`,
        knowledge_connection: completedBooks.length >= 2
          ? `'${completedBooks[0]?.title}'과 '${completedBooks[1]?.title}'은 모두 자기 성장이라는 큰 맥락에서 연결됩니다.`
          : '더 많은 책을 읽으면 지식의 연결 고리를 분석해드릴게요.',
        next_step_advice: `${topCat} 분야를 더 깊이 파고들어 보세요. 관련 고전을 읽으면 기존 지식이 더 단단해집니다.`,
      });
    }

    // Real Groq API call
    const completedBooks = books.filter((b: any) => b.status === 'completed');
    const bookList = completedBooks.map((b: any) => `${b.title} (${b.category}) - 소감: ${b.note || '없음'}`).join('\n');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: '너는 20년 경력의 전문 독서 코치야. 사용자의 독서 소감을 분석하여 따뜻하면서도 지적인 피드백을 한국어로 제공해줘. 답변은 반드시 JSON 형식으로 해. 키: growth_summary(한줄요약), knowledge_connection(책들의연결고리), next_step_advice(다음독서조언)' },
          { role: 'user', content: `현재 챌린지: ${challengeType}, 완독: ${completedCount}권\n\n읽은 책:\n${bookList}\n\n위 독서 기록을 분석해줘.` }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        growth_summary: content.slice(0, 100),
        knowledge_connection: '분석 중 형식 오류가 발생했습니다.',
        next_step_advice: '다양한 분야의 책을 읽어보세요.',
      });
    }
  } catch (e) {
    return NextResponse.json({
      growth_summary: '분석을 준비 중입니다.',
      knowledge_connection: '더 많은 책을 읽으면 연결 고리를 찾아드릴게요.',
      next_step_advice: '오늘도 한 페이지 더 읽어보세요!',
    });
  }
}
