import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const vaqueiros = sqliteTable('vaqueiros', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	cpf: text('cpf').notNull().unique(),
	nomeCompleto: text('nome_completo').notNull(),
	apelido: text('apelido'),
	nomeMae: text('nome_mae'),
	nomePai: text('nome_pai'),
	identidade: text('identidade'),
	dataNascimento: text('data_nascimento').notNull(),
	telefone: text('telefone'),
	logradouro: text('logradouro'),
	numero: text('numero'),
	bairro: text('bairro'),
	comunidade: text('comunidade'),
	cidade: text('cidade'),
	cep: text('cep'),
	tituloEleitor: text('titulo_eleitor'),
	responsavelId: text('responsavel_id').references(() => vaqueiros.id), // Vínculo de maior
	grauParentesco: text('grau_parentesco'), // mae, pai, avo, avó, tio, tia, tutor, outro
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export const animais = sqliteTable('animais', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	nome: text('nome').notNull(),
	cor: text('cor'),
	raca: text('raca'),
	dataNascimento: text('data_nascimento'),
	peso: real('peso'),
	categoria: text('categoria'), // puxador ou esteirador
	pai: text('pai'),
	mae: text('mae'),
	valorReal: real('valor_real'),
	vaqueiroId: text('vaqueiro_id')
		.notNull()
		.references(() => vaqueiros.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export const lotes = sqliteTable('lotes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	inicio: integer('inicio').notNull(),
	fim: integer('fim').notNull(),
	dataCompeticao: text('data_competicao'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export const senhas = sqliteTable('senhas', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	numero: integer('numero').notNull(),
	status: text('status', { enum: ['disponivel', 'vinculado'] }).default('disponivel'),
	dataCompeticao: text('data_competicao'),
	loteId: text('lote_id').references(() => lotes.id),
	
	// Puxador
	vaqueiroPuxadorId: text('vaqueiro_puxador_id').references(() => vaqueiros.id),
	animalPuxadorId: text('animal_puxador_id').references(() => animais.id),
	
	// Esteira
	vaqueiroEsteiraId: text('vaqueiro_esteira_id').references(() => vaqueiros.id),
	animalEsteiraId: text('animal_esteira_id').references(() => animais.id),
	
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export * from './auth.schema';
