import { buildSchema } from "graphql";
import fs from "fs";
import path from "path";
import * as authResolver from "./resolvers/auth.resolver";
import * as boardResolver from "./resolvers/board.resolver";
import * as taskResolver from "./resolvers/task.resolver";
import * as memberResolver from "./resolvers/member.resolver";

const schemaFile = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8");
export const schema = buildSchema(schemaFile);

export const rootValue = {
  ...authResolver,
  ...boardResolver,
  ...taskResolver,
  ...memberResolver,
};
