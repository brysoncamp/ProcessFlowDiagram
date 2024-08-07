const plantData = {
    units: [
        {id: "u0001", name: "Thickener 1", symbol: "Thickener", x: -180, y: -60},
        {id: "u0002", name: "Thickener 2 O/F Pump", symbol: "Pump (Centrifugal)", x: -160, y: 100},
        {id: "u0003", name: "Thickener 3", symbol: "Thickener", x: -180, y: -180}
    ],
    streams: [
        {id: "s0001", fromUnit: "u0001", fromSite: "left-0.1", toUnit: "u0002", toSite: "top-0.5"},
        {id: "s0002", fromUnit: "u0003", fromSite: "right-0.25", toUnit: "u0002", toSite: "bottom-0.5"},
    ]
}



