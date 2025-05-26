"use client";

import { Alert, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";
import { useForm } from "react-hook-form";
import { apiClient } from "@shared/lib/api-client";

export function CreatePlotForm() {
  const form = useForm<any>({
    defaultValues: {
      number: 0,
      status: "",
      customerName: "",
      color: "",
      soldTo: "",
      soldOn: "",
      amountCollected: 0,
      amountCollectedTillDate: 0,
      pendingAmount: 0,
      nextInstallmentDate: "",
      nextInstallmentAmount: 0,
      amountGivenTo: "",
      amountGivenOn: "",
      documents: [],
    },
  });

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        number: values.number ?parseInt(values.number) : null,
        amountCollected: values.amountCollected ? parseInt(values.amountCollected) : null,
        soldOn: values.soldOn ? new Date(values.soldOn).toISOString() : null,
        nextInstallmentDate: values.nextInstallmentDate ? new Date(values.nextInstallmentDate).toISOString() : null,
        amountGivenOn: values.amountGivenOn ? new Date(values.amountGivenOn).toISOString() : null,
        documents: typeof values.documents === "string"
          ? values.documents.split(",").map(d => d.trim())
          : values.documents || [],
      };

      console.log(payload);
   
      const plot = await apiClient.plots.$post({ json: payload });

      console.log("Created plot:", plot);
    } catch (error) {
      console.error(error);
      form.setError("root", { message: "Failed to create plot" });
    }
  };

  return (
    <div>
      {form.formState.isSubmitSuccessful ? (
        <Alert variant="success">
          <AlertTitle>Plot created successfully!</AlertTitle>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {form.formState.errors.root?.message && (
              <Alert variant="error">
                <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Number</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soldTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold To</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soldOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold On</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountCollected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Collected</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add other fields similarly */}

            <FormField
              control={form.control}
              name="documents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documents (comma separated URLs)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter URLs separated by commas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={form.formState.isSubmitting}
            >
              Submit
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}