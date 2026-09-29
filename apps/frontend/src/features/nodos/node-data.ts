export type NetworkNode = {
  id: string;
  sequentialId: number;
  name: string;
  used: number;
  capacity: number;
  latitude: number;
  longitude: number;
  coverageName: string;
  coverageDescription: string;
};

const nodeSeed: Array<Omit<NetworkNode, "id" | "coverageName" | "coverageDescription">> = [
  { sequentialId: 1, name: "NOC", used: 34, capacity: 128, latitude: 19.6371, longitude: -98.9823 },
  { sequentialId: 2, name: "Torre Cirsa", used: 8, capacity: 128, latitude: 19.6018, longitude: -99.0507 },
  { sequentialId: 3, name: "Torre America Latina", used: 16, capacity: 128, latitude: 19.6624, longitude: -98.9911 },
  { sequentialId: 4, name: "Torre Oso", used: 11, capacity: 128, latitude: 19.6942, longitude: -98.9224 },
  { sequentialId: 5, name: "Torre Tequis", used: 8, capacity: 128, latitude: 19.5746, longitude: -99.0362 },
  { sequentialId: 6, name: "Torre Mision", used: 20, capacity: 128, latitude: 19.6468, longitude: -98.9421 },
  { sequentialId: 7, name: "Torre Llano", used: 17, capacity: 128, latitude: 19.6745, longitude: -98.8762 },
  { sequentialId: 8, name: "Torre Urbi", used: 9, capacity: 128, latitude: 19.6261, longitude: -98.9004 },
  { sequentialId: 9, name: "Torre Santa Rosa", used: 11, capacity: 128, latitude: 19.6523, longitude: -99.0251 },
  { sequentialId: 10, name: "Torre Americas", used: 11, capacity: 128, latitude: 19.6302, longitude: -98.8464 },
  { sequentialId: 11, name: "Torre Tezoyuca", used: 7, capacity: 158, latitude: 19.5903, longitude: -98.9142 },
  { sequentialId: 12, name: "Torre Xometla", used: 2, capacity: 128, latitude: 19.7094, longitude: -98.8831 },
  { sequentialId: 13, name: "Torre Tequisistlan", used: 11, capacity: 128, latitude: 19.6864, longitude: -98.8236 },
  { sequentialId: 14, name: "Torre Ixtapan", used: 7, capacity: 128, latitude: 19.7211, longitude: -98.8734 },
  { sequentialId: 15, name: "Torre Ahuehuetes", used: 0, capacity: 128, latitude: 19.6123, longitude: -98.8607 },
  { sequentialId: 16, name: "Torre Madero", used: 10, capacity: 128, latitude: 19.5452, longitude: -99.0182 },
  { sequentialId: 17, name: "Torre Tocuila", used: 8, capacity: 128, latitude: 19.5161, longitude: -98.9052 },
  { sequentialId: 18, name: "Torre Nexquipayac", used: 0, capacity: 128, latitude: 19.5964, longitude: -98.9631 },
  { sequentialId: 19, name: "Torre Teotihuacan", used: 32, capacity: 128, latitude: 19.6872, longitude: -98.8724 },
  { sequentialId: 20, name: "Torre Tlajinga", used: 30, capacity: 128, latitude: 19.6564, longitude: -98.8431 },
  { sequentialId: 21, name: "Torre Cozotlan", used: 13, capacity: 128, latitude: 19.7018, longitude: -98.9315 },
  { sequentialId: 22, name: "Torre Palapa", used: 4, capacity: 128, latitude: 19.6187, longitude: -98.9343 },
  { sequentialId: 23, name: "Torre San Jose", used: 8, capacity: 128, latitude: 19.5761, longitude: -98.9548 },
  { sequentialId: 24, name: "Torre Los Hornos", used: 9, capacity: 128, latitude: 19.5537, longitude: -98.9242 },
  { sequentialId: 25, name: "Torre Saladito", used: 21, capacity: 512, latitude: 19.6318, longitude: -98.8106 },
  { sequentialId: 26, name: "Torre La Luna", used: 118, capacity: 256, latitude: 19.6421, longitude: -98.7894 },
  { sequentialId: 27, name: "Torre Olimpica", used: 61, capacity: 128, latitude: 19.6094, longitude: -98.8325 },
  { sequentialId: 28, name: "Torre Impulsora", used: 20, capacity: 128, latitude: 19.5348, longitude: -99.0437 },
  { sequentialId: 29, name: "Nodo Eufrates", used: 53, capacity: 384, latitude: 19.4991, longitude: -99.0612 },
  { sequentialId: 30, name: "Torre Las Huertas", used: 20, capacity: 128, latitude: 19.7314, longitude: -98.9251 },
];

export const networkNodes: NetworkNode[] = nodeSeed.map((node) => ({
  ...node,
  id: `NODE-${String(node.sequentialId).padStart(3, "0")}`,
  coverageName: node.sequentialId === 1 ? "Chairel" : `${node.name.replace(/^Torre\s/, "")} 360`,
  coverageDescription: node.sequentialId === 1 ? "Cobertura principal del centro de operaciones" : `Cobertura inalámbrica de ${node.name}`,
}));
