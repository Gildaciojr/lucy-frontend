"use client";

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center py-10 px-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-lucy-purple mb-6 text-center">
          Política de Privacidade – Lucy
        </h1>

        <p className="mb-4">
          A <strong>Lucy</strong> valoriza a sua privacidade e se compromete a
          proteger os dados pessoais de todos os usuários. Esta política explica
          como coletamos, usamos e protegemos suas informações.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Coleta de informações</h2>
        <p className="mb-4">
          Quando você se conecta com o <strong>Google Calendar</strong>,
          recebemos acesso apenas às informações de eventos do seu calendário
          para exibição e sincronização dentro da plataforma Lucy. Nenhum outro
          dado da sua conta Google é coletado ou armazenado.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Uso das informações</h2>
        <p className="mb-4">
          As informações de eventos são utilizadas exclusivamente para exibir e
          sincronizar seus compromissos no painel Lucy. Esses dados não são
          compartilhados com terceiros nem utilizados para fins de marketing.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Armazenamento e segurança</h2>
        <p className="mb-4">
          Armazenamos apenas os tokens de acesso criptografados necessários para
          manter a conexão com o Google Calendar. Todas as informações são
          protegidas em servidores seguros e acessíveis apenas por sistemas
          autorizados.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Revogação de acesso</h2>
        <p className="mb-4">
          Você pode revogar o acesso da Lucy à sua conta Google a qualquer
          momento em{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            myaccount.google.com/permissions
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Contato</h2>
        <p className="mb-4">
          Em caso de dúvidas sobre esta Política de Privacidade, entre em contato conosco
          pelo e-mail{" "}
          <a
            href="mailto:contato@mylucy.app"
            className="text-blue-600 underline"
          >
            contato@mylucy.app
          </a>
          .
        </p>

        <p className="text-sm text-gray-500 mt-8 text-center">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}
