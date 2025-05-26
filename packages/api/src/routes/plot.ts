import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import { db } from "@repo/database";
import { authMiddleware } from "../middleware/auth";
import { error } from "console";

const plotSchema = z.object({
  number: z.number().optional(),
  status: z.string().optional(),
  customerName: z.string(),
  color: z.string().optional(),
  soldTo: z.string().optional(),
  soldOn: z.string().optional(),
  amountCollected: z.number().optional(),
  amountCollectedTillDate: z.number().optional(),
  pendingAmount: z.number().optional(),
  nextInstallmentDate: z.string().optional(),
  nextInstallmentAmount: z.number().optional(),
  amountGivenTo: z.string().optional(),
  amountGivenOn: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

 
export const plotsRouter = new Hono()
  .basePath("/plots")
  .use(authMiddleware)
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
    const userId = c.get("user").id;
    const member =  await db.member.findFirst({
      where: {
        organizationId: org_id,
        userId: userId
      }
    })
    if (!member) return error("you do not belong to this organisation");
    const plots = await db.plots?.findMany({
        where: {
            organizationId: org_id,
        },
    });
    return c.json(plots);
  })
.post("/",
  describeRoute({
		tags: ["Plots"],
		summary: "create plot",
		responses: {
			200: {
				description: "create plot",
				content: {
					"application/json": {
					},
				},
			},
		},
	}),
  async (c) => {
    try {
      const userId = c.get("user").id;
      const member = await db.member.findFirst({ where: { userId } });
      if (!member) return c.json({ error: "Not authorized" }, 403);

      const organizationId = member.organizationId;
      const text = await c.req.text();
      let data;

      if (text) {
        data = JSON.parse(text);
        console.log("Parsed data:", data);
      } else {
        return error("No data provided");
      }
    

      const plot = await db.plots.create({
        data: {
          ...data,
          organizationId,
        },
      });

      return c.json(plot);
    } catch (e: any) {
      console.error("Error in POST /plots:", e);
      return c.json({ error: error || "Unknown error" }, 400);
    }
  }
);




  // export const createPlot = new Hono()
  // .basePath("/plots")
  // .use(authMiddleware)
  // .post("/",
  //   describeRoute({
	// 	tags: ["Plots"],
	// 	summary: "Create a new plot",
	// 	responses: {
	// 		200: {
	// 			description: "Returns the created plot",
	// 			content: {
	// 				"application/json": {
	// 					// schema: resolver(PostSchema),
	// 				},
	// 			},
	// 		},
	// 	},
	// }),
  //  async (c) => {
  //   const { number , status , color , soldTo , soldOn, amountCollected , amountCollectedTillDate,
  //     pendingAmount,nextInstallmentDate,nextInstallmentAmount, amountGivenTo,
  //      amountGivenOn , documents } = await c.req.valid("json");
  //      const organizationId = "GZuIMsha8PoqO2eUnNvYZ82T7pwHyv2L";
  //   const plot = await db.plots.create({
  //     data: {
  //      number , status , color , soldTo , soldOn, amountCollected , amountCollectedTillDate,
  //     pendingAmount,nextInstallmentDate,nextInstallmentAmount, amountGivenTo,
  //      amountGivenOn , documents, organizationId
  //     },
  //   });
  //   return c.json(plot);
  // });
