const assetPathPrefix = "https://www.figma.com/api/mcp/asset/c5c9b876-916f-4adc-8605-4169f94d4db8";
type LogotipoIpeBookProps = {
  className?: string;
  variante?: "Padrão";
};

function LogotipoIpeBook({ className, variante = "Padrão" }: LogotipoIpeBookProps) {
  return (
    <div className={className || "content-stretch flex items-center relative"} data-node-id="166:381">
      <p className="[word-break:break-word] font-['Source_Serif_4:Bold'] font-bold leading-[normal] relative shrink-0 text-[28px] text-[color:var(--brand-brown,#58331f)] tracking-[-0.56px] whitespace-nowrap" data-node-id="166:391">
        IpêBook
      </p>
    </div>
  );
}

export default function Component0103CriarConta() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="336:118" data-name="01.03 · Criar conta">
      <div className="absolute content-stretch flex flex-col inset-[44px_0_24px_0] items-start overflow-x-clip overflow-y-auto pb-[24px] pt-[32px] px-[24px]" data-node-id="336:119" data-name="Conteúdo">
        <div className="content-stretch flex flex-col gap-[var(--space-4,16px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="336:120" data-name="Formulário · Conteúdo adaptável">
          <div className="content-stretch flex flex-col gap-[var(--space-3,12px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="336:121" data-name="Identidade e instrução">
            <LogotipoIpeBook className="content-stretch cursor-pointer flex items-center relative shrink-0" />
            <p className="[word-break:break-word] font-['Source_Serif_4:Bold'] font-bold leading-[36px] min-w-full relative shrink-0 text-[30px] text-[color:var(--on-surface,#1d1b18)] w-[min-content]" data-node-id="336:123">
              Crie sua conta
            </p>
            <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[24px] min-w-full not-italic relative shrink-0 text-[16px] text-[color:var(--on-surface-variant,#4d4740)] w-[min-content]" data-node-id="336:124" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              Anuncie, troque, venda ou doe livros perto de você.
            </p>
          </div>
          <CodeConnectSnippet data-node-id="336:168" data-name="Material 3 · Botão · G Continuar com Google">
            {/* Material 3 Design Kit component */}
            <ButtonOutline booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Continuar com Google" labelText="Continuar com Google" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
          </CodeConnectSnippet>
          <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="336:173" data-name="Divisor · ou">
            <div className="bg-[var(--outline-variant,#d3ccc2)] flex-[1_0_0] h-px min-w-px relative" data-node-id="336:174" data-name="Linha" />
            <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] whitespace-nowrap" data-node-id="336:175" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              ou crie com e-mail
            </p>
            <div className="bg-[var(--outline-variant,#d3ccc2)] flex-[1_0_0] h-px min-w-px relative" data-node-id="336:176" data-name="Linha" />
          </div>
          <div className="content-stretch flex flex-col gap-[var(--space-2,8px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="336:125" data-name="Campos">
            <CodeConnectSnippet data-node-id="336:126" data-name="Material 3 · Campo">
              {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/text-fields/overview */}
              <TextField textSupportingText="Supporting text" supportingText="Supporting text" textInputText="Input" inputText="Input" textLabelText="Nome completo" labelText="Nome completo" textPlaceholderText="Placeholder" placeholderText="Placeholder" booleanShowSupportingText={false} showSupportingText={false} variantStyle="Outlined" style="Outlined" variantState="Enabled" state="Enabled" variantTextConfigurations="Label text" textConfigurations="Label text" variantLeadingIcon="False" leadingIcon="False" variantTrailingIcon="False" trailingIcon="False" />
            </CodeConnectSnippet>
            <CodeConnectSnippet data-node-id="336:127" data-name="Material 3 · Campo">
              {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/text-fields/overview */}
              <TextField textSupportingText="Supporting text" supportingText="Supporting text" textInputText="Input" inputText="Input" textLabelText="E-mail" labelText="E-mail" textPlaceholderText="Placeholder" placeholderText="Placeholder" booleanShowSupportingText={false} showSupportingText={false} variantStyle="Outlined" style="Outlined" variantState="Enabled" state="Enabled" variantTextConfigurations="Label text" textConfigurations="Label text" variantLeadingIcon="False" leadingIcon="False" variantTrailingIcon="False" trailingIcon="False" />
            </CodeConnectSnippet>
            <CodeConnectSnippet data-node-id="336:128" data-name="Material 3 · Campo">
              {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/text-fields/overview */}
              <TextField textSupportingText="Supporting text" supportingText="Supporting text" textInputText="Input" inputText="Input" textLabelText="Senha" labelText="Senha" textPlaceholderText="Placeholder" placeholderText="Placeholder" booleanShowSupportingText={false} showSupportingText={false} variantStyle="Outlined" style="Outlined" variantState="Enabled" state="Enabled" variantTextConfigurations="Label text" textConfigurations="Label text" variantLeadingIcon="False" leadingIcon="False" variantTrailingIcon="False" trailingIcon="False" />
            </CodeConnectSnippet>
          </div>
          <CodeConnectSnippet data-node-id="336:130" data-name="Material 3 · Aceite dos termos">
            {/* Material 3 Design Kit component */}
            <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={true} showLeadingElement={true} slotContent="336:136" content="336:136" booleanShowTrailingElement={false} showTrailingElement={false} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
              <LeadingElement slotContent="-1:-1" content="-1:-1" booleanSelected={false} selected={false} instanceSwapIcon="86:822" icon="86:822" variantType="Checkbox" type="Checkbox">
                <Checkboxes booleanShowFocusIndicator={false} showFocusIndicator={false} variantType="Unselected" type="Unselected" variantState="Enabled" state="Enabled" />
              </LeadingElement>
              <Content slotContent="-1:-1" content="-1:-1" textSupportingText="e a política de privacidade." supportingText="e a política de privacidade." textLabelText="Aceito os termos de uso" labelText="Aceito os termos de uso" textOverlineText="Overline" overlineText="Overline" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={false} showOverlineText={false} variantType="Text" type="Text" />
            </ListItem>
          </CodeConnectSnippet>
          <div className="content-stretch cursor-pointer flex flex-col gap-[var(--space-3,12px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="336:131" data-name="Ações de acesso">
            <CodeConnectSnippet data-node-id="336:132" data-name="Material 3 · Link · Criar conta">
              {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/buttons/overview */}
              <Button booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:148" icon="77:148" booleanShowIcon={false} showIcon={false} textLabelText="Criar conta" labelText="Criar conta" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
            </CodeConnectSnippet>
            <CodeConnectSnippet data-node-id="336:133" data-name="Material 3 · Link · Já tenho conta">
              {/* Material 3 Design Kit component */}
              <ButtonOutline booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Já tenho conta" labelText="Já tenho conta" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
            </CodeConnectSnippet>
          </div>
        </div>
      </div>
      <CodeConnectSnippet data-node-id="336:134" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="336:135" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
    </div>
  );
}