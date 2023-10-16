"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const uniNames: any = ["nu", "aitu", "kbtu", "sdu", "school", "other"];
const studyYears: any = ["found", "1", "2", "3", "4", "grad", "school"];

const MAX_PARTICIPANTS = 3;
const MIN_AGE = 16;

const formSchema = z.object({
  teamName: z.string({ required_error: "Please enter your team name" }).min(2),
  mode: z.enum(["online", "offline"], {
    required_error: "You need to select a participation mode.",
  }),
  captain: z.object({}),
  teammates: z
    .array(
      z.object({
        name: z.string({ required_error: "Please enter the name" }).min(3),
        surname: z
          .string({ required_error: "Please enter the surname" })
          .min(3),
        age: z.number({ required_error: "Please enter the age" }).min(MIN_AGE),
        gender: z.enum(["male", "female", "prefer not to say"], {
          required_error: "Please select your gender",
        }),
        email: z
          .string({ required_error: "Please enter the email address" })
          .min(3)
          .email(),
        uni: z.enum(uniNames, {
          required_error: "Please select your University/School",
        }),
        studyYear: z.enum(studyYears, {
          required_error: "Please select your year of study",
        }),
        cv: z
          .string({ required_error: "CV is required" })
          .min(3)
          .url()
          .startsWith("https://drive.google.com/"),
        cert: z
          .string({ required_error: "This document is required" })
          .min(3)
          .url()
          .startsWith("https://drive.google.com/"),
      })
    )
    .optional(),
});

export default function RegistrationForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Team Name <span className="text-destructive"> *</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Abi, I have no idea" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display team name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                Participation mode <span className="text-destructive"> *</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="online" />
                    </FormControl>
                    <FormLabel className="font-normal">Online</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="offline" />
                    </FormControl>
                    <FormLabel className="font-normal">Offline</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          Submit <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}
