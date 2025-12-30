"use client";

import Modal from "./Modal";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} position="left">
      <div className="p-6 space-y-5">
        <div className="flex gap-5">
          {/* Delivery Section */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Доставка</h3>
            <div className="space-y-3 text-gray-700">
              <p>Доставка по городу Фергана бесплатная.</p>
              <p>
                Доставка в другие города Узбекистана осуществляется курьерской
                службой по усмотрению для заказов стоимостью до 200 000 сум в
                количестве от 4-5 единиц товара.
              </p>
              <p>
                Срок доставки от 24 до 7дн рабочих дней, в зависимости от
                удаленности региона.
              </p>
            </div>
          </section>
          {/* Payment Section */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Оплата</h3>
            <p className="text-gray-700 mb-4">
              Мы принимаем оплату с карт UZCARD, HUMO любых банков, а также
              Payme CARD.
            </p>
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-bold text-blue-600">UZCARD</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-bold text-green-600">HUMO</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow">
                <span className="font-bold text-cyan-600">Payme</span>
              </div>
            </div>
          </section>
          {/* Contact Section */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Связаться с нами
            </h3>
            <div className="space-y-3">
              <a
                href="https://t.me/artlavka.uz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                </svg>
                <span>Telegram: https://t.me/artlavka.uz</span>
              </a>
              <a
                href="mailto:support@artlavka.uz"
                className="flex items-center gap-3 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>Электронная почта: support@artlavka.uz</span>
              </a>
            </div>
          </section>
        </div>

        {/* About Us Section */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">О нас</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              Добро пожаловать в наш интернет-магазин эксклюзивных дизайнерских
              футболок! Мы рады предложить вам уникальные и стильные футболки с
              авторскими иллюстрациями, созданными нашими талантливыми
              художниками.
            </p>
            <p>
              Мы используем качественные материалы и современные технологии
              печати, чтобы гарантировать долговечность и яркость наших изделий.
            </p>
            <p>
              В нашем каталоге вы найдете множество разнообразных дизайнов - от
              креативных и смешных до серьезных и стильных. Если у вас возникли
              вопросы или пожелания, наша команда всегда готова помочь вам!
            </p>

            <div className="space-y-2 pt-4">
              <p className="font-semibold text-purple-600">Художники:</p>
              <a
                href="https://www.instagram.com/yana_zakhang/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>https://www.instagram.com/yana_zakhang/</span>
              </a>
              <p className="font-semibold text-purple-600 pt-2">
                Следите за нами в Instagram:
              </p>
              <a
                href="https://www.instagram.com/art_lavka.uz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>https://www.instagram.com/art_lavka.uz/</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
