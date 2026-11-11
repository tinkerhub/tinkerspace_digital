export function removeDuplicates(datas) {
  if (!Array.isArray(datas)) return [];
  return datas.reduce((acc, current) => {
    if (!current) return acc;
    const key = current.membershipId ?? current.id ?? current.name;
    const existingItem = key
      ? acc.find(item => (item.membershipId ?? item.id ?? item.name) === key)
      : null;
    if (!existingItem) {
      acc.push(current);
    }
    return acc;
  }, []);
}
  