import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { initialSm2State } from '../lib/sm2';

export default function DeckDetail() {
  const { id } = useParams<{ id: string }>();
  const deckId = Number(id);

  const deck = useLiveQuery(() => db.decks.get(deckId), [deckId]);
  const cards = useLiveQuery(
    () => db.cards.where('deckId').equals(deckId).reverse().sortBy('createdAt'),
    [deckId],
  );
  const dueCount = useLiveQuery(
    () => db.cards.where('deckId').equals(deckId).and((c) => c.dueAt <= Date.now()).count(),
    [deckId],
  );

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    const now = Date.now();
    await db.cards.add({
      deckId,
      front: front.trim(),
      back: back.trim(),
      createdAt: now,
      lastReviewedAt: null,
      dueAt: now,
      ...initialSm2State(),
    } as never);
    setFront('');
    setBack('');
  }

  async function deleteCard(cardId: number) {
    await db.cards.delete(cardId);
  }

  if (deck === undefined) return <div className="p-6">불러오는 중…</div>;
  if (deck === null) return <div className="p-6">덱을 찾을 수 없습니다.</div>;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← 덱 목록
      </Link>
      <h1 className="mt-2 mb-2 text-3xl font-bold">{deck.name}</h1>
      <p className="mb-6 text-sm text-gray-500">
        카드 {cards?.length ?? 0}장 · 복습 대기 {dueCount ?? 0}장
      </p>

      <Link
        to={`/deck/${deckId}/study`}
        className="mb-6 inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        학습 시작
      </Link>

      <form onSubmit={addCard} className="mb-6 space-y-2 rounded border border-gray-200 p-4">
        <h2 className="font-semibold">새 카드</h2>
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="앞면 (질문)"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="뒷면 (정답)"
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          카드 추가
        </button>
      </form>

      {cards && cards.length > 0 && (
        <ul className="space-y-2">
          {cards.map((c) => (
            <li key={c.id} className="rounded border border-gray-200 p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.front}</p>
                  <p className="text-sm text-gray-600">{c.back}</p>
                </div>
                <button
                  onClick={() => deleteCard(c.id)}
                  className="ml-3 text-sm text-red-600 hover:underline"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
