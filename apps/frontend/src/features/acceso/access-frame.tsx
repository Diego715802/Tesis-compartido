import Image from "next/image";
import Link from "next/link";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import styles from "./access-screen.module.css";

export function AccessFrame({ children, titleId = "titulo-acceso" }: { children: React.ReactNode; titleId?: string }) {
  return <main className={styles.page}>
    <a className={styles.skipLink} href="#formulario-acceso">Ir al formulario de acceso</a>
    <section className={styles.brandPanel} aria-label="ComeCore: controla, conecta y crece">
      <div className={styles.brandHeader}><span className={styles.wordmark}>Come<span>Core</span></span><span className={styles.productName}>Gestión para ISP</span></div>
      <div className={styles.brandContent}>
        <Image className={styles.logo} src="/brand/comecore-controla-conecta-crece.png" alt="Logo oficial de ComeCore" width={510} height={489} sizes="(max-width: 767px) 64px, (max-width: 1023px) 230px, 290px" priority />
        <div className={styles.brandCopy}><h2>Tu operación,<br /> en un mismo lugar.</h2><p>Clientes, contratos y red.<br />Conectados en ComeCore.</p></div>
      </div>
      <div className={styles.brandFooter}><span>Controla. Conecta. Crece.</span><span className={styles.brandLine} aria-hidden="true" /></div>
    </section>
    <section className={styles.accessPanel} aria-labelledby={titleId}>
      <header className={styles.accessHeader}><Link href="/login" className={styles.erpLink}>Acceso al ERP <ArrowOutwardRoundedIcon aria-hidden="true" /></Link></header>
      <div className={styles.accessContent}>{children}</div>
      <footer className={styles.accessFooter}><span>ComeCore ERP</span><span>Controla, conecta y crece.</span></footer>
    </section>
  </main>;
}
