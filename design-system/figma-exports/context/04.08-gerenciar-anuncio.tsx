const assetPathPrefix = "https://www.figma.com/api/mcp/asset/1c925698-e6eb-4900-a2f4-b3bc94fd6f68";
export default function Component0408GerenciarAnuncio() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="149:3348" data-name="04.08 · Gerenciar anúncio">
      <CodeConnectSnippet data-node-id="149:3349" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="149:3364" data-name="Material 3 · App bar · Gerenciar anúncio">
        {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/app-bars/overview */}
        <AppBar instanceSwapImage="77:3308" image="77:3308" booleanShow3rdTrailingAction={false} show3rdTrailingAction={false} booleanShow2ndTrailingAction={false} show2ndTrailingAction={false} booleanShow1stTrailingAction={false} show1stTrailingAction={false} variantConfiguration="Small" configuration="Small" variantElevation="Flat" elevation="Flat">
          <LeadingIcon booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:3408" icon="77:3408" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
            <Icon />
          </LeadingIcon>
          <TextContent textSupportingText="Supporting text" supportingText="Supporting text" booleanShowSupportingText={false} showSupportingText={false} textHeadline="Gerenciar anúncio" headline="Gerenciar anúncio" variantSize="Small" size="Small" variantAlignment="Left" alignment="Left" />
        </AppBar>
      </CodeConnectSnippet>
      <div className="absolute content-stretch flex flex-col gap-[var(--space-4,16px)] inset-[146.5px_24px_62.5px_24px] items-start overflow-x-clip overflow-y-auto" data-node-id="149:3378" data-name="Conteúdo · Gerenciar anúncio">
        <p className="[word-break:break-word] font-['Source_Serif_4:Bold'] font-bold leading-[29px] relative shrink-0 text-[24px] text-[color:var(--on-surface,#1d1b18)] w-full" data-node-id="149:3381">
          Seu livro, suas escolhas.
        </p>
        <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="149:3382" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
          Acompanhe e atualize esta publicação.
        </p>
        <CodeConnectSnippet data-node-id="149:3383" data-name="Material 3 · Prévia do anúncio">
          {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
          <HorizontalCard textSubheadText="Subhead" subheadText="Subhead" instanceSwapSlotSwap="77:4508" slotSwap="77:4508" textHeaderText="Header" headerText="Header" slotContent="149:3384" content="149:3384" variantStyle="Filled" style="Filled" variantLayout="Slot" layout="Slot">
            <CapaOPequenoPrNcipe textAutor="SAINT-EXUPÉRY" autor="SAINT-EXUPÉRY" textTitulo="O Pequeno Príncipe" titulo="O Pequeno Príncipe" variantCor="Azul" cor="Azul" variantMotivo="Estrelas" motivo="Estrelas" />
            <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
          </HorizontalCard>
        </CodeConnectSnippet>
        <CodeConnectSnippet data-node-id="149:3402" data-name="Material 3 · Cartão · Anúncio ativo">
          {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
          <HorizontalCard instanceSwapSlotSwap="77:4508" slotSwap="77:4508" textHeaderText="Anúncio ativo" headerText="Anúncio ativo" slotContent="149:3403" content="149:3403" textSubheadText="O Pequeno Príncipe está disponível para venda por R$ 25,00 em Piripiri." subheadText="O Pequeno Príncipe está disponível para venda por R$ 25,00 em Piripiri." variantStyle="Filled" style="Filled" variantLayout="Media & text" layout="Media & text">
            <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
          </HorizontalCard>
        </CodeConnectSnippet>
        <CodeConnectSnippet data-node-id="149:3423" data-name="Material 3 · Lista · Editar anúncio">
          {/* Material 3 Design Kit component */}
          <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={true} showLeadingElement={true} slotContent="149:3424" content="149:3424" booleanShowTrailingElement={true} showTrailingElement={true} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
            <LeadingElement slotContent="-1:-1" content="-1:-1" booleanSelected={true} selected={true} instanceSwapIcon="86:834" icon="86:834" variantType="Icon" type="Icon">
              <Icon />
            </LeadingElement>
            <Content slotContent="-1:-1" content="-1:-1" textSupportingText="Atualize fotos, preço e descrição." supportingText="Atualize fotos, preço e descrição." textLabelText="Editar anúncio" labelText="Editar anúncio" textOverlineText="Overline" overlineText="Overline" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={false} showOverlineText={false} variantType="Text" type="Text" />
            <TrailingElement slotContent="-1:-1" content="-1:-1" instanceSwapIcon="86:824" icon="86:824" textTrailingText="⌘C" trailingText="⌘C" booleanShowTrailingText={false} showTrailingText={false} variantType="Icon" type="Icon">
              <Icon />
            </TrailingElement>
          </ListItem>
        </CodeConnectSnippet>
        <CodeConnectSnippet data-node-id="149:3441" data-name="Material 3 · Lista · Pausar anúncio">
          {/* Material 3 Design Kit component */}
          <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={true} showLeadingElement={true} slotContent="149:3442" content="149:3442" booleanShowTrailingElement={false} showTrailingElement={false} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
            <LeadingElement slotContent="-1:-1" content="-1:-1" booleanSelected={true} selected={true} instanceSwapIcon="86:828" icon="86:828" variantType="Icon" type="Icon">
              <Icon />
            </LeadingElement>
            <Content slotContent="-1:-1" content="-1:-1" textSupportingText="O livro deixa de aparecer no catálogo." supportingText="O livro deixa de aparecer no catálogo." textLabelText="Pausar anúncio" labelText="Pausar anúncio" textOverlineText="Overline" overlineText="Overline" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={false} showOverlineText={false} variantType="Text" type="Text" />
          </ListItem>
        </CodeConnectSnippet>
        <div className="content-stretch cursor-pointer flex flex-col gap-[var(--space-2,8px)] items-start relative shrink-0 w-full" data-node-id="149:3458" data-name="Ações">
          <CodeConnectSnippet data-node-id="149:3459" data-name="Material 3 · Marcar como concluído">
            {/* Material 3 Design Kit component */}
            <ButtonOutline booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Marcar como concluído" labelText="Marcar como concluído" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
          </CodeConnectSnippet>
          <CodeConnectSnippet data-node-id="399:7311" data-name="Ação · Excluir anúncio">
            {/* Material 3 Design Kit component */}
            <ButtonText booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Excluir anúncio" labelText="Excluir anúncio" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
          </CodeConnectSnippet>
        </div>
      </div>
      <CodeConnectSnippet data-node-id="149:3379" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
    </div>
  );
}