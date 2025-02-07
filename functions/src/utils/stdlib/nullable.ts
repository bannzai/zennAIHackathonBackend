import type z from "zod";

// NOTE: .partial() だと undefined にしかならない
export type NullableReturn<T extends z.ZodRawShape> = z.ZodObject<
  { [k in keyof T]: z.ZodNullable<T[k]> },
  z.UnknownKeysParam,
  z.ZodTypeAny
>;

export function nullableSchema<T extends z.ZodRawShape>(
  obj: z.ZodObject<T>
): NullableReturn<T> {
  const newShape: any = {};

  Object.keys(obj.shape).forEach((key) => {
    const fieldSchema = obj.shape[key];
    newShape[key] = fieldSchema.nullish();
  });

  const result: NullableReturn<T> = {
    ...(obj.shape._def as any),
    shape: () => newShape,
  };

  return result;
}
