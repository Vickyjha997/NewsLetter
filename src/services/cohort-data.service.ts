import { PrismaClient, WorkStatus } from '../../prisma/generated/prisma';

const prisma = new PrismaClient();

export interface CohortWithRelations {
    id: string;
    name: string | null;
    description: string | null;
    start_date: Date | null;
    end_date: Date | null;
    status: WorkStatus;
    program: {
        id: string;
        name: string;
        academic_partner: {
            id: string;
            name: string;
            display_name: string | null;
        } | null;
    };
    faculty: Array<{
        id: string;
        name: string;
        preferred_name: string | null;
        title: string | null;
        email: string;
        academic_partner: {
            id: string;
            name: string;
        } | null;
    }>;
    participants: Array<{
        id: string;
        name: string;
        email: string;
        linkedin_url: string | null;
    }>;
}

export class CohortDataService {
    /**
     * Get all active cohorts (status = ACTIVE and current date within start_date and end_date)
     */
    async getActiveCohorts(): Promise<CohortWithRelations[]> {
        const now = new Date();

        const cohorts = await prisma.cohort.findMany({
            where: {
                status: WorkStatus.ACTIVE,
                start_date: {
                    lte: now
                },
                end_date: {
                    gte: now
                }
            },
            include: {
                program: {
                    include: {
                        academic_partner: true
                    }
                },
                faculty_section: {
                    include: {
                        items: {
                            include: {
                                faculty: {
                                    include: {
                                        academic_partner: true
                                    }
                                }
                            }
                        }
                    }
                },
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        linkedin_url: true
                    }
                }
            }
        });

        // Transform to flat structure
        return cohorts.map(cohort => {
            // Extract faculty from faculty_section items
            const faculty = cohort.faculty_section?.items.map(item => ({
                id: item.faculty.id,
                name: item.faculty.name,
                preferred_name: item.faculty.preferred_name,
                title: item.faculty.title,
                email: item.faculty.email,
                academic_partner: item.faculty.academic_partner ? {
                    id: item.faculty.academic_partner.id,
                    name: item.faculty.academic_partner.name
                } : null
            })) || [];

            return {
                id: cohort.id,
                name: cohort.name,
                description: cohort.description,
                start_date: cohort.start_date,
                end_date: cohort.end_date,
                status: cohort.status,
                program: {
                    id: cohort.program.id,
                    name: cohort.program.name,
                    academic_partner: cohort.program.academic_partner ? {
                        id: cohort.program.academic_partner.id,
                        name: cohort.program.academic_partner.name,
                        display_name: cohort.program.academic_partner.display_name
                    } : null
                },
                faculty,
                participants: cohort.participants
            };
        });
    }

    /**
     * Get a single cohort with all relations
     */
    async getCohortById(cohortId: string): Promise<CohortWithRelations | null> {
        const cohort = await prisma.cohort.findUnique({
            where: { id: cohortId },
            include: {
                program: {
                    include: {
                        academic_partner: true
                    }
                },
                faculty_section: {
                    include: {
                        items: {
                            include: {
                                faculty: {
                                    include: {
                                        academic_partner: true
                                    }
                                }
                            }
                        }
                    }
                },
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        linkedin_url: true
                    }
                }
            }
        });

        if (!cohort) {
            return null;
        }

        // Transform to flat structure
        const faculty = cohort.faculty_section?.items.map(item => ({
            id: item.faculty.id,
            name: item.faculty.name,
            preferred_name: item.faculty.preferred_name,
            title: item.faculty.title,
            email: item.faculty.email,
            academic_partner: item.faculty.academic_partner ? {
                id: item.faculty.academic_partner.id,
                name: item.faculty.academic_partner.name
            } : null
        })) || [];

        return {
            id: cohort.id,
            name: cohort.name,
            description: cohort.description,
            start_date: cohort.start_date,
            end_date: cohort.end_date,
            status: cohort.status,
            program: {
                id: cohort.program.id,
                name: cohort.program.name,
                academic_partner: cohort.program.academic_partner ? {
                    id: cohort.program.academic_partner.id,
                    name: cohort.program.academic_partner.name,
                    display_name: cohort.program.academic_partner.display_name
                } : null
            },
            faculty,
            participants: cohort.participants
        };
    }

    /**
     * Close database connection (call when done)
     */
    async disconnect() {
        await prisma.$disconnect();
    }
}

export const cohortDataService = new CohortDataService();

