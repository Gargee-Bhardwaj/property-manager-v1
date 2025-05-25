import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { db } from "@repo/database";
 
export const plotsRouter = new Hono()
  .basePath("/plots")
  .get("/",
    describeRoute({
		tags: ["Plots"],
		summary: "Get all plots",
		responses: {
			200: {
				description: "Returns all plots",
				content: {
					"application/json": {
					},
				},
			},
		},
	}),
   async (c) => {
    const org_id = c.req.query("org_id");
    const allPlots = await db.plots.findMany();
    console.log(allPlots.map(p => p.organizationId));
    console.log(org_id);
    const plots = await db.plots.findMany({
        where: {
            organizationId: org_id,
        },
    });
    return c.json(plots);
  });