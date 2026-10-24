const assetPathPrefix = "https://www.figma.com/api/mcp/asset/a9710bcf-8df9-45e6-b817-8c95a64442e6";
const imgCirculo = `${assetPathPrefix}/e5cce.svg`;

export default function Component0404MostreSeuLivro() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="28:685" data-name="04.04 · Mostre seu livro">
      <div className="absolute content-stretch flex flex-col gap-[16px] inset-[108px_0_196px_0] items-start overflow-x-clip overflow-y-auto p-[24px]" data-node-id="28:744" data-name="Conteúdo">
        <p className="[word-break:break-word] font-['Source_Serif_4:Bold'] font-bold leading-[36px] relative shrink-0 text-[30px] text-[color:var(--on-surface,#1d1b18)] w-full" data-node-id="28:755">
          Mostre seu livro.
        </p>
        <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="28:756" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
          Uma foto nítida ajuda a conhecer o estado do exemplar. Até 3 fotos.
        </p>
        <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="28:757" data-name="Fotos">
          <div className="bg-[var(--cover-navy,#253c4f)] content-stretch flex flex-col gap-[8px] h-[280px] items-start justify-end overflow-clip pb-[16px] px-[16px] relative rounded-[var(--radius-md,12px)] shrink-0 w-[200px]" data-node-id="28:758" data-name="Foto principal">
            <div className="relative shrink-0 size-[40px]" data-node-id="28:759" data-name="Círculo">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCirculo} />
            </div>
            <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Medium'] font-medium leading-[0] not-italic relative shrink-0 text-[16px] text-[color:var(--inverse-on-surface,#f5efe8)] whitespace-nowrap" data-node-id="28:760" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              <p className="leading-[24px]">O Pequeno Príncipe</p>
            </a>
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px overflow-clip relative" data-node-id="28:761" data-name="Mais fotos">
            <CodeConnectSnippet data-node-id="116:2488" data-name="Material 3 · Adicionar foto">
              {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
              <HorizontalCard textSubheadText="Subhead" subheadText="Subhead" textHeaderText="Header" headerText="Header" instanceSwapSlotSwap="77:4508" slotSwap="77:4508" slotContent="116:2499" content="116:2499" variantStyle="Outlined" style="Outlined" variantLayout="Slot" layout="Slot">
                <IconButtonStandard booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="86:832" icon="86:832" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
                  <Icon />
                </IconButtonStandard>
                <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
              </HorizontalCard>
            </CodeConnectSnippet>
            <CodeConnectSnippet data-node-id="116:2512" data-name="Material 3 · Adicionar foto">
              {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
              <HorizontalCard textSubheadText="Subhead" subheadText="Subhead" textHeaderText="Header" headerText="Header" instanceSwapSlotSwap="77:4508" slotSwap="77:4508" slotContent="116:2523" content="116:2523" variantStyle="Outlined" style="Outlined" variantLayout="Slot" layout="Slot">
                <IconButtonStandard booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="86:832" icon="86:832" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
                  <Icon />
                </IconButtonStandard>
                <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
              </HorizontalCard>
            </CodeConnectSnippet>
          </div>
        </div>
        <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="28:770" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
          Capa ilustrativa: a foto real substitui esta prévia.
        </p>
        <CodeConnectSnippet data-node-id="28:771" data-name="Material 3 · Horizontal card">
          {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
          <HorizontalCard instanceSwapSlotSwap="77:4508" slotSwap="77:4508" textHeaderText="Dica de foto" headerText="Dica de foto" slotContent="94:2622" content="94:2622" textSubheadText="Luz natural, fundo liso e a capa inteira no quadro." subheadText="Luz natural, fundo liso e a capa inteira no quadro." variantStyle="Filled" style="Filled" variantLayout="Media & text" layout="Media & text">
            <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
          </HorizontalCard>
        </CodeConnectSnippet>
      </div>
      <CodeConnectSnippet data-node-id="28:745" data-name="Material 3 · App bar">
        {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/app-bars/overview */}
        <AppBar instanceSwapImage="77:3308" image="77:3308" booleanShow3rdTrailingAction={false} show3rdTrailingAction={false} booleanShow2ndTrailingAction={false} show2ndTrailingAction={false} booleanShow1stTrailingAction={false} show1stTrailingAction={false} variantConfiguration="Small" configuration="Small" variantElevation="Flat" elevation="Flat">
          <LeadingIcon booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:3408" icon="77:3408" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
            <Icon />
          </LeadingIcon>
          <TextContent textSupportingText="Supporting text" supportingText="Supporting text" booleanShowSupportingText={false} showSupportingText={false} textHeadline="Fotos do livro" headline="Fotos do livro" variantSize="Small" size="Small" variantAlignment="Left" alignment="Left" />
        </AppBar>
      </CodeConnectSnippet>
      <div className="absolute bg-[var(--surface-container,#f2ede5)] bottom-[24px] content-stretch cursor-pointer flex flex-col gap-[8px] items-start left-0 overflow-clip pb-[24px] pt-[16px] px-[16px] right-0" data-node-id="28:750" data-name="Barra de ação">
        <CodeConnectSnippet data-node-id="28:751" data-name="Material 3 · Button">
          {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/buttons/overview */}
          <Button booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:148" icon="77:148" booleanShowIcon={false} showIcon={false} textLabelText="Usar estas fotos" labelText="Usar estas fotos" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
        </CodeConnectSnippet>
        <CodeConnectSnippet data-node-id="28:753" data-name="Material 3 · Button - text">
          {/* Material 3 Design Kit component */}
          <ButtonText booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Tirar outra foto" labelText="Tirar outra foto" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
        </CodeConnectSnippet>
      </div>
      <CodeConnectSnippet data-node-id="306:5666" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="306:5681" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
    </div>
  );
}