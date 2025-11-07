import "dotenv/config";
import express from "express";
import http from "http";
import path from "path";
import session from "express-session";
import { graphqlHTTP } from "express-graphql";
import { schema, rootValue } from "./src/graphql/index.ts";
import { setupWebSocket } from "./src/realtime/wsServer";
import authRoutes from "./src/routes/auth.routes";
import pageRoutes from "./src/routes/pages.routes";
import expressLayouts from "express-ejs-layouts";

const app = express();
const server = http.createServer(app);
const ws = setupWebSocket(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
app.use(expressLayouts);
app.set("layout", "layout");
app.use(express.static(path.join(__dirname, "src/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(authRoutes);
app.use(pageRoutes);

app.use(
    "/graphql",
    graphqlHTTP((req) => ({
        schema,
        rootValue,
        context: { user: (req as any).session?.user, ws },
        graphiql: true,
    }))
);

server.listen(process.env.PORT || 4000, () => {
    console.log(`🚀 Syncora running at http://localhost:${process.env.PORT || 4000}`);
});
