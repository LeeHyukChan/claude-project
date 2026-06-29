import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function DeckList() {
  const decks = useLiveQuery(() => db.decks.orderBy('createdAt').reverse().toArray(), []);
  const [name, setName] = useState('');

  async function createDeck(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.decks.add({ name: trimmed, createdAt: Date.now() } as never);
    setName('');
  }

  async function deleteDeck(id: number) {
    if (!confirm('이 덱과 카드 전부 삭제할까요?')) return;
    await db.transaction('rw', db.decks, db.cards, async () => {
      await db.cards.where('deckId').equals(id).delete();
      await db.decks.delete(id);
    });
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">내 덱</h1>

      <form onSubmit={createDeck} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 덱 이름"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          추가
        </button>
      </form>

      {decks === undefined ? (
        <p className="text-gray-500">불러오는 중…</p>
      ) : decks.length === 0 ? (
        <p className="text-gray-500">아직 덱이 없습니다. 위에서 만들어보세요.</p>
      ) : (
        <ul className="space-y-2">
          {decks.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded border border-gray-200 px-4 py-3"
            >
              <Link to={`/deck/${d.id}`} className="text-lg text-blue-700 hover:underline">
                {d.name}
              </Link>
              <button
                onClick={() => deleteDeck(d.id)}
                className="text-sm text-red-600 hover:underline"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
