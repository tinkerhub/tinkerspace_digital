export function removeDuplicates(datas) {
    return (datas || []).reduce((acc, current) => {
      const existingItem = acc.find(item => item.membershipId === current.membershipId);
      if (!existingItem) {
        acc.push(current);
      }
      return acc;
    }, []);
  }
  