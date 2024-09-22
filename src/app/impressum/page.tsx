'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ImpressumPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Impressum
          </h1>
          
          <div className="glass-panel p-8 rounded-lg max-w-3xl mx-auto">
            {/* Angaben gemäß § 5 TMG */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Angaben gemäß § 5 TMG</h2>
              <p>
                Aachen Blockchain Club e.V.<br />
                Pontwall 3<br />
                52062 Aachen
              </p>
              <p>Vertreten durch: Lorenz Lehmann</p>
            </section>

            {/* Kontakt */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Kontakt</h2>
              <p>
                E-Mail: <a href="mailto:lorenz.lehmann@rwth-aachen.de" className="text-blue-400 hover:underline">lorenz.lehmann@rwth-aachen.de</a>
              </p>
            </section>

            {/* Registereintrag */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Registereintrag</h2>
              <p>
                Eintragung im Registergericht Aachen<br />
                Registernummer: VR 6351
              </p>
            </section>

            {/* Verbraucherstreitbeilegung */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            {/* Haftungsausschluss */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Haftungsausschluss</h2>

              {/* Haftung für Inhalte */}
              <h3 className="text-xl font-semibold mb-2 text-blue-300">Haftung für Inhalte</h3>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>

              {/* Haftung für Links */}
              <h3 className="text-xl font-semibold my-2 text-blue-300">Haftung für Links</h3>
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </section>

            {/* Urheberrecht */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Urheberrecht</h2>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </section>

            <div className="mt-8 text-sm text-gray-400">
              <p>
                Quelle: <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://www.e-recht24.de</a>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-400 hover:underline">
              Zurück zur Startseite
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ImpressumPage;
