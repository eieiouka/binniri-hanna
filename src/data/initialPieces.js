const initialPieces = [
  { id: "musume", label: "娘", x: 1, y: 0, w: 2, h: 2, type: "main" },

  { id: "chichi", label: "父親", x: 0, y: 0, w: 1, h: 2, type: "vertical" },
  { id: "haha", label: "母親", x: 3, y: 0, w: 1, h: 2, type: "vertical" },

  { id: "sofu", label: "祖父", x: 0, y: 2, w: 1, h: 2, type: "vertical" },
  { id: "sobo", label: "祖母", x: 3, y: 2, w: 1, h: 2, type: "vertical" },

  { id: "kyoudai", label: "兄弟", x: 1, y: 2, w: 2, h: 1, type: "horizontal" },

  { id: "friend1", label: "友達", x: 1, y: 3, w: 1, h: 1, type: "small" },
  { id: "friend2", label: "友達", x: 2, y: 3, w: 1, h: 1, type: "small" },

  { id: "friendL", label: "友達", x: 0, y: 4, w: 1, h: 1, type: "small" },
  { id: "friendR", label: "友達", x: 3, y: 4, w: 1, h: 1, type: "small" },
];

export default initialPieces;