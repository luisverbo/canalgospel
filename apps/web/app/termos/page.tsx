import { LegalLayout, H2, P, UL, LI, Bold } from '../_legal/LegalLayout'

export const metadata = {
  title: 'Termos de Uso — Canal Gospel',
  description: 'Termos e condições de uso do aplicativo Canal Gospel.',
}

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" lastUpdated="Última atualização: junho de 2026">

      <P>
        Ao baixar, instalar ou usar o aplicativo Canal Gospel, você concorda com os seguintes Termos
        de Uso. Leia com atenção antes de usar o app.
      </P>

      <H2>1. Sobre o aplicativo</H2>
      <P>
        O Canal Gospel é um aplicativo cristão de estudos bíblicos, devocionais e pregações em vídeo,
        disponível gratuitamente com recursos premium opcionais (&ldquo;Plano Pregador&rdquo;). O
        conteúdo é produzido pelo Canal Gospel e por pregadores parceiros.
      </P>

      <H2>2. Uso permitido</H2>
      <P>Você pode usar o Canal Gospel para:</P>
      <UL>
        <LI>Ler estudos bíblicos e devocionais para uso pessoal e espiritual.</LI>
        <LI>Assistir pregações em vídeo.</LI>
        <LI>Gerar esboços de sermão com o Assistente de IA (assinantes).</LI>
        <LI>
          Compartilhar conteúdo do app em redes sociais e grupos, com atribuição ao Canal Gospel.
        </LI>
      </UL>

      <H2>3. Uso proibido</H2>
      <P>É expressamente proibido:</P>
      <UL>
        <LI>Reproduzir, distribuir ou comercializar o conteúdo do app sem autorização prévia por escrito.</LI>
        <LI>Usar o app para fins ilegais, difamatórios, ofensivos ou contrários à fé cristã.</LI>
        <LI>Tentar acessar áreas restritas do sistema ou interferir no funcionamento do app.</LI>
        <LI>Criar contas falsas ou usar o app para spam.</LI>
      </UL>

      <H2>4. Conteúdo dos parceiros</H2>
      <P>
        O conteúdo publicado por pregadores parceiros é de responsabilidade de seus respectivos
        autores. O Canal Gospel modera o conteúdo antes da publicação, mas não se responsabiliza por
        opiniões teológicas individuais dos parceiros. Em caso de conteúdo impróprio, entre em
        contato conosco para remoção.
      </P>

      <H2>5. Plano Pregador (assinatura)</H2>
      <P>
        O Plano Pregador é uma assinatura paga processada pelo Google Play Billing. Ao assinar:
      </P>
      <UL>
        <LI>Você tem acesso ao Assistente de Sermão com IA e à experiência sem anúncios.</LI>
        <LI>A cobrança é recorrente (mensal ou anual) até o cancelamento.</LI>
        <LI>Cancelamentos devem ser feitos diretamente pelo Google Play.</LI>
        <LI>Oferecemos 7 dias de teste gratuito para novos assinantes.</LI>
        <LI>Não realizamos reembolsos fora da política do Google Play.</LI>
      </UL>

      <H2>6. Conteúdo gerado por IA</H2>
      <P>
        Os esboços de sermão gerados pelo Assistente de IA são sugestões criadas por inteligência
        artificial. Eles não substituem o preparo pastoral, o estudo bíblico pessoal nem a unção do
        pregador. O Canal Gospel não se responsabiliza pelo uso do conteúdo gerado em pregações ou
        ensinamentos. Revise sempre o material antes de usá-lo.
      </P>

      <H2>7. Propriedade intelectual</H2>
      <P>
        Todo o conteúdo original do Canal Gospel (textos, devocionais, design, marca) é protegido
        por direitos autorais. Conteúdos de parceiros pertencem a seus respectivos autores. A
        reprodução não autorizada é proibida.
      </P>

      <H2>8. Disponibilidade do serviço</H2>
      <P>
        O Canal Gospel se esforça para manter o app disponível continuamente, mas não garante
        disponibilidade ininterrupta. Podemos realizar manutenções, atualizações ou suspender o
        serviço sem aviso prévio em casos de necessidade técnica.
      </P>

      <H2>9. Limitação de responsabilidade</H2>
      <P>O Canal Gospel não se responsabiliza por:</P>
      <UL>
        <LI>Danos decorrentes do uso ou impossibilidade de uso do app.</LI>
        <LI>
          Conteúdo de sites ou serviços externos vinculados no app (ex.: YouTube).
        </LI>
        <LI>Perdas de dados causadas por falhas do dispositivo do usuário.</LI>
      </UL>

      <H2>10. Lei aplicável</H2>
      <P>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca do Rio de
        Janeiro — RJ para dirimir quaisquer controvérsias.
      </P>

      <H2>11. Alterações nos Termos</H2>
      <P>
        Podemos atualizar estes Termos a qualquer momento. Notificaremos por meio do app sobre
        mudanças relevantes. O uso continuado após a notificação constitui aceitação das alterações.
      </P>

      <H2>12. Contato</H2>
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
