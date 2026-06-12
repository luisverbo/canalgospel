import { LegalLayout, H2, P, UL, LI, Bold } from '../_legal/LegalLayout'

export const metadata = {
  title: 'Política de Privacidade — Canal Gospel',
  description: 'Como o Canal Gospel coleta, usa e protege seus dados.',
}

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" lastUpdated="Última atualização: junho de 2026">

      <P>
        O aplicativo Canal Gospel (&ldquo;nós&rdquo;, &ldquo;nosso&rdquo;) respeita sua privacidade.
        Esta Política descreve quais informações coletamos, como usamos e como protegemos seus dados
        ao usar nosso aplicativo Android e site.
      </P>

      <H2>1. Informações que coletamos</H2>

      <P>
        <Bold>Identificador anônimo de dispositivo</Bold><br />
        Geramos um ID aleatório no seu aparelho para funcionalidades como salvar favoritos e histórico
        de sermões. Esse ID não contém nenhuma informação pessoal e não é vinculado à sua identidade.
      </P>

      <P>
        <Bold>Dados de uso e analytics</Bold><br />
        Coletamos informações anônimas sobre como você usa o app (telas visitadas, conteúdos lidos,
        tempo de sessão) por meio do Firebase Analytics (Google). Esses dados são agregados e anônimos.
      </P>

      <P>
        <Bold>Dados de assinatura</Bold><br />
        Caso você assine o Plano Pregador, a compra é processada pelo Google Play Billing. Não
        armazenamos dados de cartão de crédito — o pagamento é gerenciado integralmente pelo Google.
      </P>

      <P>
        <Bold>Anúncios</Bold><br />
        Exibimos anúncios por meio do Google AdMob, que pode coletar dados do dispositivo para
        personalizar anúncios conforme suas configurações de privacidade do Android. Assinantes do
        Plano Pregador não veem anúncios. Para mais informações, consulte a{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
          className="text-[#2E2860] underline">Política de Privacidade do Google</a>.
      </P>

      <P>
        <Bold>Cadastro no sermão diário (WhatsApp)</Bold><br />
        Se você optar por receber o sermão diário via WhatsApp, seu número de telefone é armazenado
        em nossos servidores exclusivamente para esse envio. Você pode cancelar a qualquer momento
        respondendo &ldquo;PARAR&rdquo; à mensagem.
      </P>

      <P>
        <Bold>Conteúdo gerado por IA</Bold><br />
        Os esboços de sermão gerados pelo Assistente de IA são processados pela API da Anthropic e
        armazenados localmente no seu dispositivo. Não compartilhamos o conteúdo dos seus esboços
        com terceiros.
      </P>

      <H2>2. Como usamos as informações</H2>
      <UL>
        <LI>Exibir o devocional diário correto para a data de hoje.</LI>
        <LI>Salvar seus estudos favoritos para leitura offline.</LI>
        <LI>Personalizar e melhorar a experiência do app.</LI>
        <LI>Exibir anúncios relevantes (somente para usuários gratuitos).</LI>
        <LI>Enviar o sermão diário via WhatsApp (somente com seu consentimento).</LI>
      </UL>

      <H2>3. Compartilhamento de dados</H2>
      <P>
        Não vendemos, alugamos nem compartilhamos suas informações pessoais com terceiros, exceto:
      </P>
      <UL>
        <LI>
          <Bold>Provedores de serviço essenciais</Bold> ao funcionamento do app: Google (Firebase,
          AdMob, Play Billing), Anthropic (IA de sermão), Supabase (banco de dados).
        </LI>
        <LI>
          <Bold>Exigência legal:</Bold> quando obrigados por lei ou ordem judicial.
        </LI>
      </UL>

      <H2>4. Armazenamento e segurança</H2>
      <P>
        Seus dados são armazenados em servidores seguros (Supabase, região São Paulo — sa-east-1).
        Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso
        não autorizado.
      </P>

      <H2>5. Seus direitos (LGPD)</H2>
      <P>
        De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
      </P>
      <UL>
        <LI>Confirmar a existência de tratamento dos seus dados.</LI>
        <LI>Acessar, corrigir ou excluir seus dados.</LI>
        <LI>Solicitar a portabilidade dos dados.</LI>
        <LI>Revogar o consentimento a qualquer momento.</LI>
      </UL>
      <P>
        Para exercer seus direitos, entre em contato:{' '}
        <a href="mailto:contato@canalgospel.com.br" className="text-[#2E2860] underline">
          contato@canalgospel.com.br
        </a>
      </P>

      <H2>6. Crianças</H2>
      <P>
        O Canal Gospel não é direcionado a menores de 13 anos e não coletamos intencionalmente dados
        de crianças. Se você acredita que coletamos dados de uma criança, entre em contato para que
        possamos excluí-los imediatamente.
      </P>

      <H2>7. Alterações nesta Política</H2>
      <P>
        Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas
        por meio do app. O uso continuado após a notificação constitui aceitação das alterações.
      </P>

      <H2>8. Contato</H2>
      <P>
        <Bold>Canal Gospel</Bold><br />
        E-mail:{' '}
        <a href="mailto:luisverbo.pt@gmail.com" className="text-[#2E2860] underline">
          luisverbo.pt@gmail.com
        </a><br />
        Site:{' '}
        <a href="https://canalgospel.vercel.app" className="text-[#2E2860] underline">
          https://canalgospel.vercel.app
        </a>
      </P>

    </LegalLayout>
  )
}
