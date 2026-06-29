import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db, type Card } from '../db/db';
import { QUALITY, type Quality, review } from '../lib/sm2';

export default function Study() {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const [queue, setQueue] = useState<Card[] | null>(null);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const due = await db.cards
        .where('deckId')
        .equals(deckId)
        .and((c) => c.dueAt <= Date.now())
        .toArray();
      if (!cancelled) setQueue(due);
    })();
    return () => {
      cancelled = true;
    };
  }, [deckId]);

  if (queue === null) {
    return <div className="p-6">불러오는 중…</div>;
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold">복습할 카드가 없습니다 🎉</h1>
        <Link to={`/deck/${deckId}`} className="text-blue-600 hover:underline">
          ← 덱으로 돌아가기
        </Link>
      </div>
    );
  }

  const current = queue[0];

  async function grade(quality: Quality) {
    const next = review(
      {
        easeFactor: current.easeFactor,
        interval: current.interval,
        repetitions: current.repetitions,
      },
      quality,
    );
    await db.cards.update(current.id, {
      easeFactor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      dueAt: next.dueAt,
      lastReviewedAt: Date.now(),
    });
    setQueue((prev) => (prev ? prev.slice(1) : prev));
    setShowBack(false);
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link to={`/deck/${deckId}`} className="text-sm text-blue-600 hover:underline">
          ← 종료
        </Link>
        <span className="text-sm text-gray-500">남은 {queue.length}장</span>
      </div>

      <div className="mb-6 rounded border border-gray-300 p-8">
        <p className="text-center text-xl font-medium">{current.front}</p>
        {showBack && (
          <>
            <hr className="my-6 border-gray-200" />
            <p className="text-center text-lg text-gray-700">{current.back}</p>
          </>
        )}
      </div>

      {!showBack ? (
        <button
          onClick={() => setShowBack(true)}
          className="w-full rounded bg-blue-600 py-3 text-white hover:bg-blue-700"
        >
          정답 보기
        </button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => grade(QUALITY.AGAIN)}
            className="rounded bg-red-500 py-2 text-white hover:bg-red-600"
          >
            다시
          </button>
          <button
            onClick={() => grade(QUALITY.HARD)}
            className="rounded bg-orange-500 py-2 text-white hover:bg-orange-600"
          >
            어려움
          </button>
          <button
            onClick={() => grade(QUALITY.GOOD)}
            className="rounded bg-green-500 py-2 text-white hover:bg-green-600"
          >
            좋음
          </button>
          <button
            onClick={() => grade(QUALITY.EASY)}
            className="rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700"
          >
            쉬움
          </button>
        </div>
      )}
    </div>
  );
}
