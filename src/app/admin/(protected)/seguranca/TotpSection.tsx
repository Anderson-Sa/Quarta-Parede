"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { beginTotpEnrollment, confirmTotpEnrollment, disableTotp } from "./actions";

export function TotpSection({ enabled }: { enabled: boolean }) {
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [beginError, setBeginError] = useState<string | null>(null);
  const [pendingBegin, startBegin] = useTransition();
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmTotpEnrollment, undefined);
  const [disableState, disableAction, disablePending] = useActionState(disableTotp, undefined);

  if (enabled) {
    return (
      <div>
        <p className="text-sm text-foreground/70">
          A verificação em duas etapas está <strong className="text-emerald-400">ativada</strong> na
          sua conta. Um código do seu aplicativo autenticador é exigido a cada login.
        </p>

        <form action={disableAction} className="mt-4 max-w-xs space-y-3">
          <div>
            <label htmlFor="disable-code" className="mb-1.5 block text-sm font-medium text-foreground/70">
              Digite um código para desativar
            </label>
            <input
              id="disable-code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
            />
          </div>
          {disableState?.error && <p className="text-sm text-red-400">{disableState.error}</p>}
          <button
            type="submit"
            disabled={disablePending}
            className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {disablePending ? "Desativando..." : "Desativar 2FA"}
          </button>
        </form>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div>
        <p className="text-sm text-foreground/70">
          A verificação em duas etapas está <strong>desativada</strong>. Ative para exigir um código
          adicional do seu aplicativo autenticador (Google Authenticator, Authy, etc.) a cada login.
        </p>
        {beginError && <p className="mt-3 text-sm text-red-400">{beginError}</p>}
        <button
          type="button"
          disabled={pendingBegin}
          onClick={() =>
            startBegin(async () => {
              const result = await beginTotpEnrollment();
              if ("error" in result) {
                setBeginError(result.error);
                return;
              }
              setBeginError(null);
              setEnrollment(result);
            })
          }
          className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {pendingBegin ? "Gerando..." : "Ativar 2FA"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground/70">
        Adicione esta chave ao seu aplicativo autenticador (entrada manual) e confirme com o código
        gerado.
      </p>

      <div className="mt-4 space-y-2 rounded-md border border-surface-border bg-background p-3 text-sm">
        <p>
          <span className="text-foreground/50">Chave secreta:</span>{" "}
          <code className="break-all font-mono text-foreground">{enrollment.secret}</code>
        </p>
        <p>
          <span className="text-foreground/50">URI:</span>{" "}
          <code className="break-all font-mono text-xs text-foreground/70">{enrollment.otpauthUri}</code>
        </p>
      </div>

      <form action={confirmAction} className="mt-4 max-w-xs space-y-3">
        <input type="hidden" name="secret" value={enrollment.secret} />
        <div>
          <label htmlFor="confirm-code" className="mb-1.5 block text-sm font-medium text-foreground/70">
            Código de confirmação
          </label>
          <input
            id="confirm-code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            className="w-full rounded-md border border-surface-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-brand"
          />
        </div>
        {confirmState?.error && <p className="text-sm text-red-400">{confirmState.error}</p>}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={confirmPending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            {confirmPending ? "Confirmando..." : "Confirmar e ativar"}
          </button>
          <button
            type="button"
            onClick={() => setEnrollment(null)}
            className="rounded-md border border-surface-border px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
