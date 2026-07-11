import { assetPath } from '../lib/assets'

export function PolicyNotice({ checkbox = false, accepted = false, onChange }: { checkbox?: boolean; accepted?: boolean; onChange?: (value: boolean) => void }) {
  return (
    <section className="policy-notice" aria-labelledby="policy-title">
      <div className="policy-copy">
        <p className="section-tag">Before you reserve</p>
        <h2 id="policy-title">Drop-in workout deposit policy</h2>
        <p>The drop-in workout rate is <strong>$50</strong>. A <strong>$25 non-refundable deposit</strong> is required before the scheduled date. Your spot is not reserved until the deposit is received.</p>
        <p>The remaining <strong>$25 balance is due on the day of the workout</strong>. Deposits are not refunded for cancellations, no-shows, or late arrivals.</p>
        {checkbox && (
          <label className="policy-check">
            <input type="checkbox" checked={accepted} onChange={(event) => onChange?.(event.target.checked)} />
            <span>I understand and agree to the deposit policy.</span>
          </label>
        )}
      </div>
      <img src={assetPath('assets/deposit-policy.jpeg')} alt="Official CRM2 Skillz and Drillz drop-in workout deposit policy" />
    </section>
  )
}
