import Dexie, { type Table } from 'dexie';

export interface LocalVaqueiro {
    id: string;
    cpf: string;
    nomeCompleto: string;
    apelido?: string;
    nomeMae?: string;
    nomePai?: string;
    identidade?: string;
    genero?: string;
    dataNascimento: string;
    telefone?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    comunidade?: string;
    cidade?: string;
    cep?: string;
    tituloEleitor?: string;
    responsavelId?: string;
    grauParentesco?: string;
    createdAt?: number;
}

export interface LocalAnimal {
    id: string;
    nome: string;
    cor?: string;
    raca?: string;
    sexo?: string;
    dataNascimento?: string;
    peso?: number;
    categoria?: string;
    pai?: string;
    mae?: string;
    valorReal?: number;
    vaqueiroId?: string;
    createdAt?: number;
}

export interface LocalLote {
    id: string;
    inicio: number;
    fim: number;
    dataCompeticao?: string;
    createdAt?: number;
}

export interface LocalSenha {
    id: string;
    numero: number;
    status: 'disponivel' | 'vinculado';
    dataCompeticao?: string;
    loteId?: string;
    vaqueiroPuxadorId?: string;
    animalPuxadorId?: string;
    vaqueiroEsteiraId?: string;
    animalEsteiraId?: string;
    dataCadastro?: number;
    createdAt?: number;
}

export interface SyncAction {
    id?: number;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    body: any;
    timestamp: number;
}

export class VaquejadaDatabase extends Dexie {
    vaqueiros!: Table<LocalVaqueiro>;
    animais!: Table<LocalAnimal>;
    lotes!: Table<LocalLote>;
    senhas!: Table<LocalSenha>;
    sync_queue!: Table<SyncAction>;

    constructor() {
        super('VaquejadaDB');
        this.version(1).stores({
            vaqueiros: 'id, cpf, nomeCompleto, apelido',
            animais: 'id, nome, vaqueiroId',
            lotes: 'id',
            senhas: 'id, numero, status, loteId, vaqueiroPuxadorId, vaqueiroEsteiraId',
            sync_queue: '++id, method, url, timestamp'
        });
    }
}

export const db = new VaquejadaDatabase();
