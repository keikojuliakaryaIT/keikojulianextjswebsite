export function renderType(type: [{ id: string; type: string }], id: string) {
  const typeExists = type?.find((t: any) => t.id === id);
  return typeExists ? typeExists.type : id;
}
