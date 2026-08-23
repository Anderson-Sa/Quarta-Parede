import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AssinantesPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assinantes da newsletter</h1>
        <span className="text-sm text-neutral-500">{subscribers.length} inscritos</span>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Inscrito em</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {formatDate(subscriber.createdAt)}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-neutral-400">
                  Nenhum assinante ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
