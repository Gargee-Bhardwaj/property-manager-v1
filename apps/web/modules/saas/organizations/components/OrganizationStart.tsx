	"use client";
	import { StatsTile } from "@saas/start/components/StatsTile";
	import { Card } from "@ui/components/card";
	import { useTranslations } from "next-intl";
	import { useParams, useRouter } from "next/navigation";

	export default function OrganizationStart() {
		const t = useTranslations();
		const router = useRouter();
		const params = useParams();

	const organizationSlug = params.organizationSlug as string;

		return (
			<div className="@container">
				<div className="grid @2xl:grid-cols-3 gap-4">
				<div onClick={() => router.push(`/app/${organizationSlug}/sales`)}>
				<StatsTile title="Sales" value={344} valueFormat="number" trend={0.12} />
				</div>
				<div onClick={() => router.push(`/app/${organizationSlug}/expenses`)}>
				<StatsTile title="Expenses" value={5243} valueFormat="currency" trend={0.6} />
				</div>
				<div onClick={() => router.push(`/app/${organizationSlug}/summary`)}>
				<StatsTile title="Summary" value={0.03} valueFormat="percentage" trend={-0.3} />
				</div>
				</div>

				{/* <Card className="mt-6">
					<div className="flex h-64 items-center justify-center p-8 text-foreground/60">
						Place your content here...
					</div>
				</Card> */}
			</div>
		);
	}
