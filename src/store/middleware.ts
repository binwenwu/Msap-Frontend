import { createLogger } from "redux-logger";

// 定义一个Redux中间件
const middleware = [
    createLogger({
        duration: true,
        timestamp: false,
        collapsed: true,
        colors: {
            title: () => "#139BFE",
            prevState: () => "#1C5FAF",
            action: () => "#149945",
            nextState: () => "#A47104",
            error: () => "#ff0005",
        },
        predicate: () => typeof window !== "undefined",
    }),
];

export { middleware };
