import { z } from "zod";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { Hono } from "hono";
import { db } from "@repo/database";
import { authMiddleware } from "../middleware/auth";
import { error } from "console";
import { verifyOrganizationMembership } from "./organizations/lib/membership";
import { get } from "http";

const plotCreateSchema = z.object({
  number: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  soldTo: z.string().nullable().optional(),
  soldOn: z.string().nullable().optional(),
  amountCollected: z.number().nullable().optional(),
  amountCollectedTillDate: z.number().nullable().optional(),
  pendingAmount: z.number().nullable().optional(),
  nextInstallmentDate: z.string().nullable().optional(),
  nextInstallmentAmount: z.number().nullable().optional(),
  amountGivenTo: z.string().nullable().optional(),
  amountGivenOn: z.string().nullable().optional(),
  documents: z.array(z.string()).nullable().optional(),
  organizationId: z.string().nullable().optional(),
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
    const organizationId = c.req.query("org_id");
    const userId = c.get("user").id;
    if (organizationId) {
      await verifyOrganizationMembership(organizationId, userId);
    }
    const plots = await db.plots?.findMany({
        where: {
            organizationId: organizationId,
        },
    });
    return c.json(plots);
  })
.get("/:id",
  describeRoute({
    tags: ["Plots"],
    summary: "Get plot by id",
    responses: {
      200: {
        description: "Returns plot by id",
        content: {
          "application/json": {
          },
        },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.param();
    const plot = await db.plots.findUnique({ where: { id } });
    return c.json(plot);
  }
)
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
  validator(
			"json",
      plotCreateSchema,
		),
  async (c) => {
    try {
      const userId = c.get("user").id;
      const member = await db.member.findFirst({ where: { userId } });
      if (!member) return c.json({ error: "Not authorized" }, 403);

      const organizationId = member.organizationId;
      if (organizationId) {
				await verifyOrganizationMembership(organizationId, userId);
			}

      const data = c.req.valid("json");

      const plot = await db.plots.create({
        data: {
          number: data.number,
          status: data.status,
          customerName: data.customerName,
          color: data.color,
          soldTo: data.soldTo,
          soldOn: data.soldOn,  
          amountCollected: data.amountCollected,
          amountCollectedTillDate: data.amountCollectedTillDate,
          pendingAmount: data.pendingAmount,
          nextInstallmentDate: data.nextInstallmentDate,
          nextInstallmentAmount: data.nextInstallmentAmount,
          amountGivenTo: data.amountGivenTo,
          amountGivenOn: data.amountGivenOn,
          documents: data.documents,
          organizationId: organizationId
        },
      });

      return c.json(plot);
    } catch (e: any) {
      console.error("Error in POST /plots:", e);
      return c.json({ error: error || "Unknown error" }, 400);
    }
  }
)
.put("/:id",
  describeRoute({
    tags: ["Plots"],
    summary: "update plot",
    responses: {
      200: {
        description: "update plot",
        content: {
          "application/json": {
          },
        },
      },
    },
  }),
  validator(
      "json",
      plotCreateSchema,
    ),
  async (c) => {
    try {
      const userId = c.get("user").id;
      
      const get_plot = await db.plots.findUnique({ where: { id: c.req.param().id } });

      if (!get_plot) {
        return c.json({ error: "Plot not found" }, 404);
      }
      const organizationId = get_plot.organizationId;
      if (organizationId) {
        await verifyOrganizationMembership(organizationId, userId);
      }

      const { id } = c.req.param();
      const data = c.req.valid("json");
      const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

      const plot = await db.plots.update({
        where: { id },
        data: filteredData,
      });
      
      return c.json(plot);
    } catch (e: any) {
      console.error("Error in POST /plots:", e);
      return c.json({ error: error || "Unknown error" }, 400);
    }
  }
);

