export type Wind = "Leste" | "Sul" | "Oeste" | "Norte";

export type Seat = {
  wind: Wind;
  player: string;
  score: number;
};

export type Table = {
  id: number;
  seats: Seat[];
};

export type Round = {
  id: number;
  tables: Table[];
};

export type PairKey = string;

export type QualityReport = {
  score: number;
  maxPairRepeats: number;
  repeatedPairs: PairRepeat[];
  repeatedPairCount: number;
  idealRepeatedPairCount: number;
  twicePairCount: number;
  triplePairCount: number;
  exactEast: boolean;
  windRepeats: number;
  fullTableRepeats: number;
};

export type PairRepeat = {
  players: [string, string];
  count: number;
};

export type PairingCandidate = {
  rounds: Round[];
  quality: QualityReport;
};

export type TournamentState = {
  players: string[];
  schedule: Round[];
  quality: QualityReport | null;
  classification: Record<string, number>;
  completedTables: Record<string, boolean>;
  tableScores: Record<string, string[]>;
};

export type PdfDocument = {
  setFontSize: (size: number) => void;
  setTextColor: (...color: number[]) => void;
  text: (text: string, x: number, y: number) => void;
  autoTable: (options: Record<string, unknown>) => void;
  save: (filename: string) => void;
  internal: {
    getNumberOfPages: () => number;
    pageSize: { height: number };
  };
};

export type JsPdfWindow = Window & {
  jspdf?: {
    jsPDF: new () => PdfDocument;
  };
};
