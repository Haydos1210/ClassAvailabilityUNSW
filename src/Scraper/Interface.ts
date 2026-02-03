/**
 * @interface: Indices of all the data that can be extracted from a class chunk
 */
interface ClassInfo {
  classID: string;
  isOpen: boolean;
  date: string;
  activity: string;
}

export {
    ClassInfo
}