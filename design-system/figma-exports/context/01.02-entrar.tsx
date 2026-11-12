const assetPathPrefix = "https://www.figma.com/api/mcp/asset/54ead856-0dee-46c2-99e8-3a136300acb8";
const imgSeisClassicosBrasileirosEmEdicaoElegante = `${assetPathPrefix}/fe6a1.png`;

export default function Component0102Entrar() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="332:38" data-name="01.02 · Entrar">
      <CodeConnectSnippet data-node-id="332:54" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="332:55" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
      <div className="absolute content-stretch flex flex-col gap-[var(--space-6,24px)] items-center left-[24px] overflow-clip top-[64px] w-[345px]" data-node-id="362:6307" data-name="Conteúdo · Entrar · adaptável">
        <div className="h-[306.45px] relative shrink-0 w-[245px]" data-node-id="341:9565" data-name="Seis clássicos brasileiros em edição elegante">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSeisClassicosBrasileirosEmEdicaoElegante} />
        </div>
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[var(--space-2,8px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="362:6308" data-name="Identidade e instrução">
          <p className="font-['Source_Serif_4:Bold'] font-bold leading-[41px] relative shrink-0 text-[34px] text-[color:var(--on-surface,#1d1b18)] w-full" data-node-id="332:12723">
            Bem-vindo de volta
          </p>
          <p className="font-['Roboto_Flex:Regular'] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="332:12724" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
            Entre para continuar suas leituras.
          </p>
        </div>
        <div className="content-stretch cursor-pointer flex flex-col gap-[var(--space-3,12px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="362:6309" data-name="Ações de acesso">
          <CodeConnectSnippet data-node-id="332:50" data-name="Material 3 · Link · Entrar">
            {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/buttons/overview */}
            <Button booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:148" icon="77:148" booleanShowIcon={false} showIcon={false} textLabelText="Entrar com e-mail" labelText="Entrar com e-mail" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
          </CodeConnectSnippet>
          <CodeConnectSnippet data-node-id="332:52" data-name="Material 3 · Botão · G Continuar com Google">
            {/* Material 3 Design Kit component */}
            <ButtonOutline booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Continuar com Google" labelText="Continuar com Google" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
          </CodeConnectSnippet>
        </div>
        <div className="content-stretch flex flex-col gap-[var(--space-4,16px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="362:6310" data-name="Cadastro e documentos">
          <div className="bg-[var(--outline-variant,#d3ccc2)] h-px relative shrink-0 w-full" data-node-id="332:12725" data-name="Divisor" />
          <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[#4d4740] text-[15px] w-full" data-node-id="332:12726" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
            <p>
              <span className="leading-[normal]">{`Não tem uma conta? `}</span>
              <span className="[word-break:break-word] font-['Roboto_Flex:Medium'] font-medium leading-[normal] not-italic text-[#2c5e45]" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
                Criar conta
              </span>
            </p>
          </a>
          <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Regular'] font-normal leading-[0] not-italic relative shrink-0 text-[12px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="332:12727" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
            <p className="leading-[16px]">Ao continuar, você aceita nossa Política de Privacidade e Termos de Uso.</p>
          </a>
        </div>
      </div>
    </div>
  );
}