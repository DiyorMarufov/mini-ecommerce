import { ObjectLiteral, Repository } from "typeorm";

export const checkUniqueFields = async <T extends ObjectLiteral>(
  repo: Repository<T>,
  fields: Partial<T>,
  repoName: string
): Promise<string[]> => {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    const exists = await repo.findOne({ where: { [key]: value } as any });
    if (exists) {
      errors.push(`'${value}' ${key}'lik ${repoName} mavjud`);
    }
  }

  return errors;
};
