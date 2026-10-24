const assetPathPrefix = "https://www.figma.com/api/mcp/asset/e37fa834-42d9-434e-83d8-1f8048a2247b";
const imgIlustracaoTresClassicosSobPetalasDeIpe = `${assetPathPrefix}/47407.png`;
const imgLivroAbertoComFolhasDeIpeVoando = `${assetPathPrefix}/09195.svg`;
const imgPonto = `${assetPathPrefix}/cf90d.svg`;

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

export default function Component0101BoasVindas() {
  return (
    <div className="bg-[#fcfaf5] relative size-full" data-node-id="324:38" data-name="01.01 · Boas-vindas">
      <div className="absolute inset-[44px_0_24px_0] overflow-x-clip overflow-y-auto" data-node-id="324:39" data-name="Conteúdo">
        <LogotipoIpeBook className="absolute content-stretch cursor-pointer flex items-center left-[24px] top-[44.5px]" />
        <p className="[word-break:break-word] absolute font-['Source_Serif_4:Bold'] font-bold leading-[41px] left-[24px] text-[34px] text-[color:var(--on-surface,#1d1b18)] top-[105px] whitespace-nowrap" data-node-id="324:42">
          Uma boa história
        </p>
        <div className="absolute bg-[var(--tertiary-container,#f8d88a)] h-[37px] left-[18px] rounded-[var(--radius-sm,8px)] top-[145px] w-[272px]" data-node-id="324:43" data-name="span · merece continuar.">
          <p className="[word-break:break-word] absolute font-['Source_Serif_4:Bold'] font-bold leading-[41px] left-[6px] text-[34px] text-[color:var(--on-surface,#1d1b18)] top-[-1px] whitespace-nowrap" data-node-id="324:44">
            merece continuar.
          </p>
        </div>
        <div className="absolute h-[200px] left-[6px] top-[228px] w-[393px]" data-node-id="324:45" data-name="Livro aberto com folhas de ipê voando">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLivroAbertoComFolhasDeIpeVoando} />
        </div>
        <p className="[word-break:break-word] absolute font-['Roboto_Flex:Regular'] font-normal h-[42.8px] leading-[24px] left-[24px] not-italic text-[16px] text-[color:var(--on-surface-variant,#4d4740)] top-[474px] w-[345px]" data-node-id="324:46" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
          Livros de quem mora perto de você.
        </p>
        <CodeConnectSnippet data-node-id="324:47" data-name="Material 3 · Link · Começar">
          {/* Material 3 Design Kit component
Docs:
  https://m3.material.io/components/buttons/overview */}
          <Button booleanShowFocusIndicator={false} showFocusIndicator={false} instanceSwapIcon="77:148" icon="77:148" booleanShowIcon={false} showIcon={false} textLabelText="Começar" labelText="Começar" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
        </CodeConnectSnippet>
        <CodeConnectSnippet data-node-id="324:48" data-name="Material 3 · Link · Já tenho conta">
          {/* Material 3 Design Kit component */}
          <ButtonOutline booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Já tenho conta" labelText="Já tenho conta" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
        </CodeConnectSnippet>
        <div className="absolute bg-[var(--surface-container-lowest,white)] content-stretch flex gap-[8px] items-start left-[24px] overflow-clip top-[520px]" data-node-id="324:12600" data-name="Modalidades">
          <div className="border border-[#d9d2c5] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[7px] relative rounded-[8px] shrink-0" data-node-id="324:12601" data-name="Chip · Venda">
            <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Medium'] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] whitespace-nowrap" data-node-id="324:12602" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              <p className="leading-[20px]">Venda</p>
            </a>
          </div>
          <div className="border border-[#d9d2c5] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[7px] relative rounded-[8px] shrink-0" data-node-id="324:12603" data-name="Chip · Troca">
            <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Medium'] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] whitespace-nowrap" data-node-id="324:12604" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              <p className="leading-[20px]">Troca</p>
            </a>
          </div>
          <div className="border border-[#d9d2c5] border-solid content-stretch flex items-center overflow-clip px-[16px] py-[7px] relative rounded-[8px] shrink-0" data-node-id="324:12605" data-name="Chip · Doação">
            <a className="[word-break:break-word] block cursor-pointer font-['Roboto_Flex:Medium'] font-medium leading-[0] not-italic relative shrink-0 text-[14px] text-[color:var(--on-surface-variant,#4d4740)] whitespace-nowrap" data-node-id="324:12606" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
              <p className="leading-[20px]">Doação</p>
            </a>
          </div>
        </div>
        <div className="absolute bg-[var(--surface-container-high,#ece6dd)] content-stretch flex gap-[6px] items-center left-[250px] overflow-clip px-[12px] py-[6px] rounded-[999px] top-[50px]" data-node-id="324:12607" data-name="Localização · Piripiri">
          <div className="relative shrink-0 size-[6px]" data-node-id="324:12608" data-name="Ponto">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPonto} />
          </div>
          <p className="[word-break:break-word] font-['Roboto_Flex:Medium'] font-medium leading-[16px] not-italic relative shrink-0 text-[12px] text-[color:var(--on-surface-variant,#4d4740)] whitespace-nowrap" data-node-id="324:49" style={{ fontVariationSettings: '"GRAD" 0, "XOPQ" 96, "XTRA" 468, "YOPQ" 79, "YTAS" 750, "YTDE" -203, "YTFI" 738, "YTLC" 514, "YTUC" 712, "wdth" 100' }}>
            PIRIPIRI · PIAUÍ
          </p>
        </div>
        <CodeConnectSnippet data-node-id="324:12609" data-name="Material 3 · Link · Explorar livros sem entrar">
          {/* Material 3 Design Kit component */}
          <ButtonText booleanShowFocusIndicator={false} showFocusIndicator={false} booleanShowIcon={false} showIcon={false} instanceSwapIcon="77:148" icon="77:148" textLabelText="Explorar livros sem entrar" labelText="Explorar livros sem entrar" variantType="Round" type="Round" variantSize="Small" size="Small" variantState="Enabled" state="Enabled" />
        </CodeConnectSnippet>
        <div className="absolute left-[16.5px] size-[360px] top-[155px]" data-node-id="327:86" data-name="Ilustração · Três clássicos sob pétalas de ipê">
          <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgIlustracaoTresClassicosSobPetalasDeIpe} />
        </div>
      </div>
      <CodeConnectSnippet data-node-id="324:50" data-name="Android · Status bar oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksStatusBar booleanCameraCutout={true} cameraCutout={true} />
      </CodeConnectSnippet>
      <CodeConnectSnippet data-node-id="324:51" data-name="Android · Navigation handle oficial">
        {/* Material 3 Design Kit component */}
        <BuildingBlocksNavigation />
      </CodeConnectSnippet>
    </div>
  );
}