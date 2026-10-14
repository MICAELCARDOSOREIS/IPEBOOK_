// Tela "Explorar" — IpêBook
// Construída só com tokens e componentes descritos em design-system/*.md.
// Esta tela NÃO é um exemplo documentado (README §3 só cobre Entrar/Criar conta e Anunciar
// livro); os trechos abaixo foram inferidos a partir de 02-tokens.md, 03-fundamentos.md e
// 04-componentes/*.md. Pontos inventados estão marcados com comentário "// INVENTADO:".

import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { tokens } from "@/view/tokens";

// ---------------------------------------------------------------------------
// Tipos de dados (inferidos do enunciado: capa, título, autor, bairro, modalidade)
// ---------------------------------------------------------------------------
type Modalidade = "venda" | "troca" | "doacao";

interface Livro {
  id: string;
  titulo: string;
  autor: string;
  bairro: string;
  modalidade: Modalidade;
}

// ---------------------------------------------------------------------------
// BookCover (Capa ilustrativa) — 04-componentes/capa-ilustrativa.md
// Variante "Capa em lista" (44 px, só a arte, sem texto sobreposto)
// ---------------------------------------------------------------------------
const CORES_CAPA = [
  tokens.colors.cover.blue,
  tokens.colors.cover.brown,
  tokens.colors.cover.green,
] as const;

function hashSimples(id: string): number {
  return [...id].reduce((soma, c) => soma + c.charCodeAt(0), 0);
}

function BookCover({ idAnuncio, titulo }: { idAnuncio: string; titulo: string }) {
  const cor = CORES_CAPA[hashSimples(idAnuncio) % CORES_CAPA.length];
  return (
    <View
      accessibilityLabel={`Capa ilustrativa de ${titulo}`}
      style={{
        backgroundColor: cor,
        borderRadius: tokens.radius.large,
        width: 44,
        aspectRatio: 120 / 170,
        // elevation-1 em capas, conforme 02-tokens.md / 03-fundamentos.md
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Tag — 04-componentes/tag.md (não interativa, nome por extenso + cor fixa)
// ---------------------------------------------------------------------------
function Tag({ tipo }: { tipo: Modalidade }) {
  const mapa = {
    venda: {
      bg: tokens.colors.badge.sale.background,
      texto: tokens.colors.badge.sale.text,
      rotulo: "Venda",
    },
    troca: {
      bg: tokens.colors.badge.trade.background,
      texto: tokens.colors.badge.trade.text,
      rotulo: "Troca",
    },
    doacao: {
      bg: tokens.colors.badge.donation.background,
      texto: tokens.colors.badge.donation.text,
      rotulo: "Doação",
    },
  } as const;
  const { bg, texto, rotulo } = mapa[tipo];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: tokens.radius.small,
        paddingHorizontal: tokens.spacing[12],
        paddingVertical: tokens.spacing[6],
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: texto, ...tokens.typography.labelMedium }}>{rotulo}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Campo de busca — INVENTADO (ver item 3 do relatório): não há arquivo próprio para
// "Campo de busca", só Campo de texto (TextField, contornado) e a regra de fundo em
// 03-fundamentos.md ("busca ... em surface-container-high") e de raio em 02-tokens.md
// ("radius-full ... busca"). Combinei essas duas regras com a anatomia do TextField.
// ---------------------------------------------------------------------------
function CampoDeBusca({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View
      accessibilityRole="search"
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens.colors.surfaceContainerHigh, // INVENTADO: nome de token composto
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[16],
        height: 48, // alvo de toque mínimo de 48 dp (06-acessibilidade.md)
      }}
    >
      <Text
        // INVENTADO: ícone de lupa — não há token de ícone específico documentado para busca,
        // só a regra geral "Material Symbols Outlined, 24 px, on-surface-variant quando inativo"
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{ color: tokens.colors.secondaryText, marginRight: tokens.spacing[8], fontSize: 20 }}
      >
        🔍
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por título ou autor"
        accessibilityLabel="Buscar por título ou autor"
        style={{ flex: 1, color: tokens.colors.text, ...tokens.typography.bodyLarge }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          hitSlop={8}
        >
          <Text style={{ color: tokens.colors.secondaryText, fontSize: 18 }}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Chip de filtro — INVENTADO (ver item 3): README cita "Chip de filtro" como necessário
// para Início/Explorar, mas o arquivo de referência está em design-kit/components/Chip/,
// que a tarefa pediu para não ler. Implementei só com a regra geral de
// 01-principios.md §2 ("chip selecionado tem ícone de check, não só a cor de fundo") e
// 06-acessibilidade.md ("Chip 32 px, área de toque ampliada para 48 dp").
// ---------------------------------------------------------------------------
function ChipDeFiltro({
  rotulo,
  selecionado,
  onPress,
}: {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      accessibilityLabel={rotulo}
      hitSlop={8} // amplia a área de toque até 48 dp (chip visual continua com 32 px)
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 32,
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[12],
        marginRight: tokens.spacing[8],
        backgroundColor: selecionado ? tokens.colors.soft : "transparent",
        borderWidth: selecionado ? 0 : 1,
        borderColor: tokens.colors.border,
      }}
    >
      {selecionado ? (
        <Text style={{ color: tokens.colors.action, marginRight: tokens.spacing[6] }}>✓</Text>
      ) : null}
      <Text
        style={{
          color: selecionado ? tokens.colors.action : tokens.colors.secondaryText,
          ...tokens.typography.labelMedium,
        }}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// BookRow (Linha de livro) — INVENTADO (ver item 3): citado no README e em
// 01-principios.md §3 ("BookRow mostra 'Machado de Assis · Centro'"), mas sem arquivo
// próprio em 04-componentes/. Montei a partir de BookCover (lista, 44 px) + Tag +
// tipografia (m3-body-lg para título, m3-body-md para autor/bairro).
// ---------------------------------------------------------------------------
function BookRow({ livro, onPress }: { livro: Livro; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${livro.titulo}, ${livro.autor}, ${livro.bairro}`}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens.colors.surfaceContainerLow, // cartões/campos (03-fundamentos.md)
        borderRadius: tokens.radius.large,
        padding: tokens.spacing[12],
        marginBottom: tokens.spacing[8],
        minHeight: 48,
      }}
    >
      <BookCover idAnuncio={livro.id} titulo={livro.titulo} />
      <View style={{ flex: 1, marginLeft: tokens.spacing[12] }}>
        <Text
          numberOfLines={2}
          style={{
            color: tokens.colors.text,
            // Princípio 4: título do livro usa a serifa da marca.
            // INVENTADO: não há um tamanho de serifa "pequeno" documentado — displayLarge
            // (32 px) é só para título de tela raiz/logotipo, grande demais para uma linha
            // de lista. Usei a família da marca com o tamanho do corpo (m3-body-lg).
            fontFamily: tokens.typography.brandFamily,
            fontSize: tokens.typography.bodyLarge.fontSize,
            lineHeight: tokens.typography.bodyLarge.lineHeight,
          }}
        >
          {livro.titulo}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium, marginTop: 2 }}
        >
          {livro.autor} · {livro.bairro}
        </Text>
        <View style={{ marginTop: tokens.spacing[6] }}>
          <Tag tipo={livro.modalidade} />
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Item e barra de navegação — 04-componentes/barra-de-navegacao.md
// ---------------------------------------------------------------------------
function ItemNavegacao({
  rotulo,
  ativo,
  badge,
  onPress,
}: {
  rotulo: string;
  ativo: boolean;
  badge?: number;
  onPress: () => void;
}) {
  const rotuloAcessivel = badge ? `${rotulo}, ${badge} não lidas` : rotulo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotuloAcessivel}
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: ativo ? tokens.colors.soft : "transparent",
        borderRadius: tokens.radius.full,
        paddingHorizontal: tokens.spacing[16],
        paddingVertical: tokens.spacing[8],
      }}
    >
      <Text
        style={{
          color: ativo ? tokens.colors.action : tokens.colors.secondaryText,
          ...tokens.typography.labelSmall,
        }}
      >
        {rotulo}
      </Text>
    </Pressable>
  );
}

function BarraDeNavegacao({ ativo }: { ativo: string }) {
  const destinos = ["Início", "Explorar", "Estante", "Conversas", "Perfil"];
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: tokens.colors.surface,
        paddingVertical: tokens.spacing[8],
        paddingHorizontal: tokens.spacing[8],
        borderTopWidth: 1,
        borderTopColor: tokens.colors.border,
      }}
    >
      {destinos.map((d) => (
        <ItemNavegacao key={d} rotulo={d} ativo={d === ativo} onPress={() => {}} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Dados de exemplo — INVENTADO só para a tela ser plausível, não vem de nenhum arquivo.
// ---------------------------------------------------------------------------
const LIVROS_EXEMPLO: Livro[] = [
  { id: "1", titulo: "Dom Casmurro", autor: "Machado de Assis", bairro: "Centro", modalidade: "venda" },
  { id: "2", titulo: "Grande Sertão: Veredas", autor: "Guimarães Rosa", bairro: "Jardim das Flores", modalidade: "troca" },
  { id: "3", titulo: "Torto Arado", autor: "Itamar Vieira Junior", bairro: "Vila Nova", modalidade: "doacao" },
];

// ---------------------------------------------------------------------------
// Tela Explorar
// ---------------------------------------------------------------------------
export default function ExplorarScreen() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Modalidade | "todos">("todos");

  const resultados = LIVROS_EXEMPLO.filter((l) => {
    const bate =
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase());
    const passaFiltro = filtro === "todos" || l.modalidade === filtro;
    return bate && passaFiltro;
  });

  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.surface }}>
      {/* Título de tela raiz — serifa da marca (Princípio 4) */}
      <Text
        style={{
          color: tokens.colors.text,
          fontFamily: tokens.typography.brandFamily,
          fontSize: tokens.typography.displayLarge.fontSize,
          lineHeight: tokens.typography.displayLarge.lineHeight,
          paddingHorizontal: tokens.spacing[16],
          paddingTop: tokens.spacing[16],
        }}
      >
        Explorar
      </Text>

      <View style={{ paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[16] }}>
        <CampoDeBusca value={busca} onChangeText={setBusca} />
      </View>

      {/* Chips de filtro por modalidade — INVENTADO: lista de rótulos não vem de nenhum
          arquivo, só a existência do componente "Chip de filtro" no README. */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: tokens.spacing[16],
          paddingTop: tokens.spacing[16],
          paddingBottom: tokens.spacing[8],
        }}
      >
        <ChipDeFiltro rotulo="Todos" selecionado={filtro === "todos"} onPress={() => setFiltro("todos")} />
        <ChipDeFiltro rotulo="Venda" selecionado={filtro === "venda"} onPress={() => setFiltro("venda")} />
        <ChipDeFiltro rotulo="Troca" selecionado={filtro === "troca"} onPress={() => setFiltro("troca")} />
        <ChipDeFiltro rotulo="Doação" selecionado={filtro === "doacao"} onPress={() => setFiltro("doacao")} />
      </View>

      {resultados.length === 0 ? (
        // Estado vazio — INVENTADO: README cita "Estado vazio" só para a tela Estante;
        // reaproveitei a ideia para Explorar sem busca correspondente, sem texto oficial.
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: tokens.spacing[32],
          }}
        >
          <Text style={{ color: tokens.colors.secondaryText, ...tokens.typography.bodyMedium, textAlign: "center" }}>
            Nenhum livro encontrado no seu bairro com esse termo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: tokens.spacing[16], paddingTop: tokens.spacing[8] }}
          renderItem={({ item }) => <BookRow livro={item} onPress={() => {}} />}
          accessibilityLabel="Resultados da busca"
        />
      )}

      <BarraDeNavegacao ativo="Explorar" />
    </View>
  );
}
