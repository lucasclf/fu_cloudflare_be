import type {
	Arcana,
	CreateArcanaInput,
	CreateJobAliasInput,
	CreateJobInput,
	CreateJobPowerInput,
	CreateJobQuestionInput,
	Job,
	JobAlias,
	JobPower,
	JobQuestion,
	ResumeJob,
} from "../../domain/jobs/job";
import { JobSpell } from "../../domain/spells/spells";

export interface JobReaderPort {
	findAll(globalOnly?: boolean): Promise<Job[]>;
	findAllSummary(globalOnly?: boolean): Promise<ResumeJob[]>;
	findById(jobId: string): Promise<Job | null>;
	findSummaryByIds(jobIds: number[]): Promise<Map<number, ResumeJob>>;
}

export interface JobWriterPort {
	create(input: CreateJobInput): Promise<void>;
}

export interface JobRepositoryPort extends JobReaderPort, JobWriterPort {}

export interface JobQuestionsReaderPort {
	findByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobQuestion[]>>;
}

export interface JobAliasesReaderPort {
	findByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobAlias[]>>;
}

export interface JobQuestionsWriterPort {
	create(input: CreateJobQuestionInput): Promise<void>;
}

export interface JobAliasesWriterPort {
	create(input: CreateJobAliasInput): Promise<void>;
}

export interface JobQuestionsRepositoryPort
	extends JobQuestionsReaderPort,
		JobQuestionsWriterPort {}

export interface JobAliasesRepositoryPort
	extends JobAliasesReaderPort,
		JobAliasesWriterPort {}

export interface JobPowerReaderPort {
	findByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobPower[]>>;
}

export interface JobPowerWriterPort {
	create(input: CreateJobPowerInput): Promise<void>;
}

export interface JobPowerRepositoryPort
	extends JobPowerReaderPort,
		JobPowerWriterPort {}

export interface JobSpellReaderPort {
	findByJobIds(
		jobIds: number[],
	): Promise<Map<number, JobSpell[]>>;
}

export interface JobSpellRepositoryPort extends JobSpellReaderPort {}

export interface ArcanaReaderPort {
	findAll(): Promise<Arcana[]>;
}

export interface ArcanaWriterPort {
	create(input: CreateArcanaInput): Promise<void>;
}

export interface ArcanaRepositoryPort
	extends ArcanaReaderPort,
		ArcanaWriterPort {}