import { useMemo, useState } from 'react'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { assetPath } from '../lib/assets'
import { venmoUrl } from '../lib/data'

const sizes = ['Youth S', 'Youth M', 'Youth L', 'S', 'M', 'L', 'XL', '2XL']

export function MerchPage() {
  const [color, setColor] = useState<'Black' | 'White'>('Black')
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const total = quantity * 30
  const paymentUrl = useMemo(() => venmoUrl(total, `CRM2 shirt order - ${color} - ${size} - qty ${quantity}`), [color, size, quantity, total])

  return (
    <div className="light-page">
      <SiteHeader compact />
      <main className="merch-page">
        <header className="merch-header"><p className="section-tag">Ground Up gear</p><h1>Rep the work.</h1><p>Official CRM2 Skillz &amp; Drillz shirts. Choose black or white, select a size, and pay through Venmo.</p></header>
        <section className="product-layout">
          <div className="product-gallery">
            <img className="product-main" src={assetPath(color === 'Black' ? 'assets/merch-black-front.png' : 'assets/merch-white.png')} alt={`${color} CRM2 Skillz and Drillz shirt`} />
            <img src={assetPath('assets/merch-black-back.png')} alt="Back of black Ground Up shirt" />
          </div>
          <div className="product-details">
            <p className="product-stock">In stock · Local pickup</p>
            <h2>CRM2 Ground Up Tee</h2>
            <p className="product-price">$30</p>
            <fieldset><legend>Color</legend><div className="choice-row">{(['Black', 'White'] as const).map((item) => <button type="button" key={item} className={color === item ? 'choice choice--selected' : 'choice'} onClick={() => setColor(item)}>{item}</button>)}</div></fieldset>
            <fieldset><legend>Size</legend><div className="size-grid">{sizes.map((item) => <button type="button" key={item} className={size === item ? 'choice choice--selected' : 'choice'} onClick={() => setSize(item)}>{item}</button>)}</div></fieldset>
            <label className="field quantity"><span>Quantity</span><input type="number" min="1" max="10" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></label>
            <div className="order-summary"><span>Order total</span><strong>${total}</strong></div>
            <a className="button button--venmo" href={paymentUrl} target="_blank" rel="noreferrer">Pay ${total} with Venmo</a>
            <p className="product-note">Include the pre-filled shirt details in your Venmo payment. CRM2 will contact you at the phone number on your Venmo account to confirm pickup.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
