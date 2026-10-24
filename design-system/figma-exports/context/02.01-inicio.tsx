const assetPathPrefix = "https://www.figma.com/api/mcp/asset/bb0652c7-ba3f-46c2-aead-7d901778b30a";
export default function Component0201Inicio() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="9:525" data-name="02.01 · Início">
      <div className="absolute content-stretch flex flex-col inset-[44px_0_104px_0] items-start overflow-x-clip overflow-y-auto pb-[24px] pt-[8px] px-[24px]" data-node-id="9:529" data-name="Conteúdo">
        <div className="content-stretch flex flex-col gap-[var(--space-3,12px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="308:6002" data-name="Início · Conteúdo adaptável">
          <div className="content-stretch flex gap-[var(--space-2,8px)] items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="308:6003" data-name="Localização e notificações">
            <div className="[word-break:break-word] bg-[var(--surface-container-high,#ece6dd)] content-stretch flex gap-[6px] items-center overflow-clip pl-[12px] pr-[8px] py-[8px] relative rounded-[20px] shrink-0 whitespace-nowrap" data-node-id="137:6935" data-name="Localização">
              <p className="font-['Material_Symbols_Rounded:Regular'] font-normal leading-[normal] relative shrink-0 text-[20px] text-[color:var(--primary,#2c5e45)]" data-node-id="137:6936" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
                location_on
              </p>
              <a className="block cursor-pointer font-['Roboto_Flex:Medium'] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface,#1d1b18)]" data-node-id="137:6937" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
                <p className="leading-[20px]">Centro</p>
              </a>
              <p className="font-['Material_Symbols_Rounded:Regular'] font-normal leading-[normal] relative shrink-0 text-[20px] text-[color:var(--on-surface-variant,#4d4740)]" data-node-id="137:6938" style={{ fontVariationSettings: '"FILL" 0, "GRAD" 0' }}>
                expand_more
              </p>
            </div>
            <CodeConnectSnippet data-node-id="99:1674" data-name="Material 3 · Link · Notificações, 2 novas">
              {/* Material 3 Design Kit component */}
              <IconButtonStandard booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="86:830" icon="86:830" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
                <Icon />
              </IconButtonStandard>
            </CodeConnectSnippet>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[var(--space-2,8px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="308:6004" data-name="Apresentação">
            <div className="font-['Source_Serif_4:Bold'] font-bold leading-[0] relative shrink-0 text-[#58331f] text-[34px] w-full" data-node-id="9:540">
              <p className="leading-[41px] mb-0">Encontre sua</p>
              <p className="leading-[41px]">próxima história.</p>
            </div>
            <p className="font-['Roboto_Flex:Regular'] font-normal leading-[24px] not-italic relative shrink-0 text-[16px] text-[color:var(--on-surface-variant,#4d4740)] w-full" data-node-id="137:6941" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              Compre, troque ou receba livros de quem mora perto de você.
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[var(--space-2,8px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="308:6005" data-name="Busca e modalidades">
            <CodeConnectSnippet data-node-id="99:1681" data-name="Material 3 · Campo">
              {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/search/overview */}
              <SearchBar booleanShowLeadingIcon={true} showLeadingIcon={true} textPlaceholderText="Buscar título, autor ou categoria" placeholderText="Buscar título, autor ou categoria" booleanShow1stTrailingIcon={false} show1stTrailingIcon={false} booleanShow2ndTrailingIcon={false} show2ndTrailingIcon={false} variantState="Enabled" state="Enabled" variantShowAvatar="False" showAvatar="False">
                <LeadingIcon booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:1236" icon="77:1236" variantType="Round" type="Round" variantSize="Small" size="Small" variantWidth="Default" width="Default" variantState="Enabled" state="Enabled">
                  <Icon />
                </LeadingIcon>
              </SearchBar>
            </CodeConnectSnippet>
            <div className="content-center flex flex-wrap gap-[var(--space-2,8px)] items-center overflow-clip relative shrink-0 w-full" data-node-id="308:6006" data-name="Modalidades">
              <CodeConnectSnippet data-node-id="99:1713" data-name="Material 3 · Campo · Todos">
                {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/chips/overview */}
                <FilterChip instanceSwapTrailingIcon="77:5453" trailingIcon="77:5453" booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapLeadingIcon="77:5455" leadingIcon="77:5455" textLabelText="Todos" labelText="Todos" variantStyle="Outlined" style="Outlined" variantConfiguration="Label only" configuration="Label only" variantState="Enabled" state="Enabled" variantSelected="True" selected="True" variantShowTrailingIcon="False" showTrailingIcon="False">
                  <SelectedIcon />
                </FilterChip>
              </CodeConnectSnippet>
              <CodeConnectSnippet data-node-id="99:1718" data-name="Material 3 · Campo · Venda">
                {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/chips/overview */}
                <FilterChip instanceSwapLeadingIcon="77:5455" leadingIcon="77:5455" instanceSwapTrailingIcon="77:5453" trailingIcon="77:5453" booleanShowFocusIndicator={false} showFocusIndicator={false} textLabelText="Venda" labelText="Venda" variantStyle="Outlined" style="Outlined" variantConfiguration="Label only" configuration="Label only" variantState="Enabled" state="Enabled" variantSelected="False" selected="False" variantShowTrailingIcon="False" showTrailingIcon="False" />
              </CodeConnectSnippet>
              <CodeConnectSnippet data-node-id="99:1721" data-name="Material 3 · Campo · Troca">
                {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/chips/overview */}
                <FilterChip instanceSwapLeadingIcon="77:5455" leadingIcon="77:5455" instanceSwapTrailingIcon="77:5453" trailingIcon="77:5453" booleanShowFocusIndicator={false} showFocusIndicator={false} textLabelText="Troca" labelText="Troca" variantStyle="Outlined" style="Outlined" variantConfiguration="Label only" configuration="Label only" variantState="Enabled" state="Enabled" variantSelected="False" selected="False" variantShowTrailingIcon="False" showTrailingIcon="False" />
              </CodeConnectSnippet>
              <CodeConnectSnippet data-node-id="99:1724" data-name="Material 3 · Campo · Doação">
                {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/chips/overview */}
                <FilterChip instanceSwapLeadingIcon="77:5455" leadingIcon="77:5455" instanceSwapTrailingIcon="77:5453" trailingIcon="77:5453" booleanShowFocusIndicator={false} showFocusIndicator={false} textLabelText="Doação" labelText="Doação" variantStyle="Outlined" style="Outlined" variantConfiguration="Label only" configuration="Label only" variantState="Enabled" state="Enabled" variantSelected="False" selected="False" variantShowTrailingIcon="False" showTrailingIcon="False" />
              </CodeConnectSnippet>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[var(--space-2,8px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="308:6007" data-name="Livros perto de você">
            <div className="content-stretch flex gap-[var(--space-2,8px)] items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="308:6008" data-name="Título e ação">
              <p className="[word-break:break-word] font-['Roboto_Flex:Regular'] font-normal leading-[28px] not-italic relative shrink-0 text-[22px] text-[color:var(--on-surface,#1d1b18)] whitespace-nowrap" data-node-id="9:559" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
                Perto de você
              </p>
              <CodeConnectSnippet data-node-id="99:1727" data-name="Material 3 · Link · Ver todos">
                {/* Material 3 Design Kit component */}
                <ButtonText booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Ver todos" labelText="Ver todos" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
              </CodeConnectSnippet>
            </div>
            <div className="content-stretch cursor-pointer flex gap-[var(--space-3,12px)] items-start overflow-clip relative shrink-0 w-full" data-node-id="308:6009" data-name="Cards de livros">
              <CodeConnectSnippet data-node-id="108:2317" data-name="Material 3 · Card de livro">
                {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
                <HorizontalCard textSubheadText="Subhead" subheadText="Subhead" instanceSwapSlotSwap="77:4508" slotSwap="77:4508" textHeaderText="Header" headerText="Header" slotContent="108:2352" content="108:2352" variantStyle="Filled" style="Filled" variantLayout="Slot" layout="Slot">
                  <CapaOPequenoPrNcipe textAutor="SAINT-EXUPÉRY" autor="SAINT-EXUPÉRY" textTitulo="O Pequeno Príncipe" titulo="O Pequeno Príncipe" variantCor="Azul" cor="Azul" variantMotivo="Estrelas" motivo="Estrelas" />
                  <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={false} showLeadingElement={false} slotContent="108:2350" content="108:2350" booleanShowTrailingElement={false} showTrailingElement={false} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
                    <Content slotContent="-1:-1" content="-1:-1" textSupportingText="Saint-Exupéry" supportingText="Saint-Exupéry" textLabelText="O Pequeno Príncipe" labelText="O Pequeno Príncipe" textOverlineText="Venda · R$ 25,00" overlineText="Venda · R$ 25,00" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={true} showOverlineText={true} variantType="Text" type="Text" />
                  </ListItem>
                  <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
                </HorizontalCard>
              </CodeConnectSnippet>
              <CodeConnectSnippet data-node-id="108:2371" data-name="Material 3 · Card de livro">
                {/* Material 3 Design Kit component
Docs:
  http://m3.material.io/components/cards/overview */}
                <HorizontalCard textSubheadText="Subhead" subheadText="Subhead" instanceSwapSlotSwap="77:4508" slotSwap="77:4508" textHeaderText="Header" headerText="Header" slotContent="108:2399" content="108:2399" variantStyle="Filled" style="Filled" variantLayout="Slot" layout="Slot">
                  <CapaDomCasmurro textAutor="M. DE ASSIS" autor="M. DE ASSIS" textTitulo="Dom Casmurro" titulo="Dom Casmurro" variantCor="Marrom" cor="Marrom" variantMotivo="Ondas" motivo="Ondas" />
                  <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={false} showLeadingElement={false} slotContent="108:2397" content="108:2397" booleanShowTrailingElement={false} showTrailingElement={false} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
                    <Content slotContent="-1:-1" content="-1:-1" textSupportingText="Machado de Assis" supportingText="Machado de Assis" textLabelText="Dom Casmurro" labelText="Dom Casmurro" textOverlineText="Troca" overlineText="Troca" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={true} showOverlineText={true} variantType="Text" type="Text" />
                  </ListItem>
                  <Background booleanShowFocusIndicator={false} showFocusIndicator={false} variantState="Enabled" state="Enabled" />
                </HorizontalCard>
              </CodeConnectSnippet>
            </div>
          </div>
          <CodeConnectSnippet data-node-id="108:2412" data-name="Material 3 · Link · Doações da semana 3 livros gratu">
            {/* Material 3 Design Kit component */}
            <ListItem booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLeadingElement={true} showLeadingElement={true} slotContent="108:2426" content="108:2426" booleanShowTrailingElement={true} showTrailingElement={true} variantAlignment="Middle-aligned" alignment="Middle-aligned" variantState="Enabled" state="Enabled" variantSelected="False" selected="False">
              <LeadingElement slotContent="-1:-1" content="-1:-1" booleanSelected={true} selected={true} instanceSwapIcon="86:834" icon="86:834" variantType="Icon" type="Icon">
                <Icon />
              </LeadingElement>
              <Content slotContent="-1:-1" content="-1:-1" textSupportingText="3 livros gratuitos em Piripiri" supportingText="3 livros gratuitos em Piripiri" textLabelText="Doações da semana" labelText="Doações da semana" textOverlineText="Overline" overlineText="Overline" booleanShowSupportingText={true} showSupportingText={true} booleanShowOverlineText={false} showOverlineText={false} variantType="Text" type="Text" />
              <TrailingElement slotContent="-1:-1" content="-1:-1" instanceSwapIcon="86:824" icon="86:824" textTrailingText="⌘C" trailingText="⌘C" booleanShowTrailingText={false} showTrailingText={false} variantType="Icon" type="Icon">
                <Icon />
              </TrailingElement>
            </ListItem>
          </CodeConnectSnippet>
        </div>
      </div>
      <CodeConnectSnippet data-node-id="22:2" data-name="Material 3 · Navigation Bar: Vertical items">
        {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/navigation-bar/overview */}
        <NavigationBarVerticalItems variantNavItems="5" navItems="5">
          <NavItem01 instanceSwapIcon="419:26055" icon="419:26055" textLabelText="Início" labelText="Início" instanceSwapIconSelected="419:26055" iconSelected="419:26055" booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowLabelText={true} showLabelText={true} variantState="Enabled" state="Enabled" variantBadge="None" badge="None" variantSelected="True" selected="True">
            <Icon />
            <Icon />
          </NavItem01>
          <NavItem02 textLabelText="Explorar" labelText="Explorar" booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:1236" icon="77:1236" instanceSwapIconSelected="77:1236" iconSelected="77:1236" booleanShowLabelText={true} showLabelText={true} variantState="Enabled" state="Enabled" variantBadge="None" badge="None" variantSelected="False" selected="False">
            <Search />
            <Search />
          </NavItem02>
          <NavItem03 textLabelText="Estante" labelText="Estante" booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="86:834" icon="86:834" instanceSwapIconSelected="86:834" iconSelected="86:834" booleanShowLabelText={true} showLabelText={true} variantState="Enabled" state="Enabled" variantBadge="None" badge="None" variantSelected="False" selected="False">
            <Bookmark />
            <Bookmark />
          </NavItem03>
          <NavItem04 textLabelText="Conversas" labelText="Conversas" booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="419:26058" icon="419:26058" instanceSwapIconSelected="419:26058" iconSelected="419:26058" booleanShowLabelText={true} showLabelText={true} variantState="Enabled" state="Enabled" variantBadge="None" badge="None" variantSelected="False" selected="False">
            <Icon />
            <Icon />
          </NavItem04>
          <NavItem05 textLabelText="Perfil" labelText="Perfil" booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="86:822" icon="86:822" instanceSwapIconSelected="86:822" iconSelected="86:822" booleanShowLabelText={true} showLabelText={true} variantState="Enabled" state="Enabled" variantBadge="None" badge="None" variantSelected="False" selected="False">
            <Icon />
            <Icon />
          </NavItem05>
        </NavigationBarVerticalItems>
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="306:5428" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="306:5443" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
    </div>
  );
}