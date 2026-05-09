"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { surveySchema, type SurveyInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import type { LookupItem } from "@/lib/lookups";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { RadioGroup } from "@/components/ui/radio-group";
import { RatingScale } from "@/components/ui/rating-scale";
import { Loader2 } from "lucide-react";

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export function SurveyForm({ ageGroups }: { ageGroups: LookupItem[] }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SurveyInput>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      is_church_member: undefined as unknown as boolean,
      age_group: "",
      vibrancy_rating: undefined as unknown as number,
      weaknesses: "",
      strengths: "",
      programs_to_incorporate: "",
      fundraising_ideas: "",
      influence_rating: undefined as unknown as number,
      pull_teenagers: "",
      feels_supported: undefined,
      serves_best: undefined,
      service_hindrances: "",
      attends_youth_service: undefined,
      not_attending_reason: "",
      has_district: undefined,
      attends_fellowship: undefined,
      district_hindrance: "",
      would_like_to_join: undefined,
      other_suggestions: "",
    },
  });

  const ageGroup = watch("age_group");
  const isYouth = ageGroup === "13-35";
  const attendsYouthService = watch("attends_youth_service");
  const hasDistrict = watch("has_district");

  async function onSubmit(values: SurveyInput) {
    const payload = {
      is_church_member: values.is_church_member,
      age_group: values.age_group,
      vibrancy_rating: values.vibrancy_rating,
      weaknesses: values.weaknesses || null,
      strengths: values.strengths || null,
      programs_to_incorporate: values.programs_to_incorporate || null,
      fundraising_ideas: values.fundraising_ideas || null,
      influence_rating: values.influence_rating,
      pull_teenagers: values.pull_teenagers || null,
      feels_supported: isYouth ? values.feels_supported ?? null : null,
      serves_best: isYouth ? values.serves_best ?? null : null,
      service_hindrances: isYouth ? values.service_hindrances || null : null,
      attends_youth_service: isYouth ? values.attends_youth_service ?? null : null,
      not_attending_reason: isYouth ? values.not_attending_reason || null : null,
      has_district: isYouth ? values.has_district ?? null : null,
      attends_fellowship: isYouth ? values.attends_fellowship ?? null : null,
      district_hindrance: isYouth ? values.district_hindrance || null : null,
      would_like_to_join: isYouth ? values.would_like_to_join ?? null : null,
      other_suggestions: values.other_suggestions || null,
    };

    const { error } = await supabase.from("survey_responses").insert(payload);

    if (error) {
      console.error(error);
      toast.error("Could not submit your response. Please try again.");
      return;
    }

    toast.success("Thank you for your feedback!");
    router.push("/survey/thanks");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {/* ---- SECTION A: About you ---- */}
      <Section
        index="01"
        title="About you"
        subtitle="So we can group your feedback correctly."
      >
        <Field error={errors.is_church_member?.message}>
          <Label required>Are you a member of PCEA Nanyuki Town Church?</Label>
          <Controller
            control={control}
            name="is_church_member"
            render={({ field }) => (
              <RadioGroup
                name="is_member"
                value={
                  field.value === true ? "yes" : field.value === false ? "no" : undefined
                }
                onChange={(v) => field.onChange(v === "yes")}
                columns={2}
                options={yesNo as unknown as { value: string; label: string }[]}
              />
            )}
          />
        </Field>

        <Field error={errors.age_group?.message}>
          <Label required>Age group</Label>
          <Controller
            control={control}
            name="age_group"
            render={({ field }) => (
              <RadioGroup
                name="age_group"
                value={field.value}
                onChange={field.onChange}
                columns={3}
                options={ageGroups.map((a) => ({
                  value: a.name,
                  label: a.name === "51+" ? "51 and above" : `${a.name} years`,
                }))}
              />
            )}
          />
        </Field>
      </Section>

      {/* ---- SECTION B: Fellowship feedback ---- */}
      <Section
        index="02"
        title="The youth fellowship"
        subtitle="Your candid view on where we are."
      >
        <Field error={errors.vibrancy_rating?.message}>
          <Label required>
            On a scale of 1 to 10, how do you rate the vibrancy of our youth
            fellowship?
          </Label>
          <Controller
            control={control}
            name="vibrancy_rating"
            render={({ field }) => (
              <RatingScale
                name="vibrancy"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field>
          <Label htmlFor="weaknesses">
            Areas we need to improve on (our weaknesses)
          </Label>
          <Textarea
            id="weaknesses"
            placeholder="Be honest — this is how we grow."
            {...register("weaknesses")}
          />
        </Field>

        <Field>
          <Label htmlFor="strengths">
            Areas the youth fellowship ranks highly (our strengths)
          </Label>
          <Textarea
            id="strengths"
            placeholder="What's working well?"
            {...register("strengths")}
          />
        </Field>

        <Field>
          <Label htmlFor="programs_to_incorporate">
            What programs should we incorporate in our calendar of events?
          </Label>
          <Textarea
            id="programs_to_incorporate"
            placeholder="Retreats, outreaches, sports, careers, mentorship…"
            {...register("programs_to_incorporate")}
          />
        </Field>

        <Field>
          <Label htmlFor="fundraising_ideas">
            Any ideas on how we can raise funds to support our activities?
          </Label>
          <Textarea
            id="fundraising_ideas"
            placeholder="Harambees, talent shows, partnerships, projects…"
            {...register("fundraising_ideas")}
          />
        </Field>

        <Field error={errors.influence_rating?.message}>
          <Label required>
            On a scale of 1 to 10, how do you rate the influence of the youth
            in this church?
          </Label>
          <Controller
            control={control}
            name="influence_rating"
            render={({ field }) => (
              <RatingScale
                name="influence"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field>
          <Label htmlFor="pull_teenagers">
            What can we do to pull the teenagers (13–19) into the youth
            fellowship?
          </Label>
          <Textarea
            id="pull_teenagers"
            placeholder="Your ideas help us reach the next generation."
            {...register("pull_teenagers")}
          />
        </Field>
      </Section>

      {/* ---- SECTION C: Youth-only ---- */}
      {isYouth && (
        <Section
          index="03"
          title="For youths only (13–35)"
          subtitle="A few questions just for those in the fellowship age bracket."
          accent
        >
          <Field error={errors.feels_supported?.message}>
            <Label required>Do you feel supported by the church?</Label>
            <Controller
              control={control}
              name="feels_supported"
              render={({ field }) => (
                <RadioGroup
                  name="feels_supported"
                  value={
                    field.value === true ? "yes" : field.value === false ? "no" : undefined
                  }
                  onChange={(v) => field.onChange(v === "yes")}
                  columns={2}
                  options={yesNo as unknown as { value: string; label: string }[]}
                />
              )}
            />
          </Field>

          <Field>
            <Label>
              Do you feel like you serve to the best of your God-given ability?
            </Label>
            <Controller
              control={control}
              name="serves_best"
              render={({ field }) => (
                <RadioGroup
                  name="serves_best"
                  value={
                    field.value === true ? "yes" : field.value === false ? "no" : undefined
                  }
                  onChange={(v) => field.onChange(v === "yes")}
                  columns={2}
                  options={yesNo as unknown as { value: string; label: string }[]}
                />
              )}
            />
          </Field>

          <Field>
            <Label htmlFor="service_hindrances">
              What hinders you from serving to the maximum?
            </Label>
            <Textarea
              id="service_hindrances"
              placeholder="Time, fear, lack of training, family…"
              {...register("service_hindrances")}
            />
          </Field>

          <Field>
            <Label>Do you attend our youth service?</Label>
            <Controller
              control={control}
              name="attends_youth_service"
              render={({ field }) => (
                <RadioGroup
                  name="attends_youth_service"
                  value={
                    field.value === true ? "yes" : field.value === false ? "no" : undefined
                  }
                  onChange={(v) => field.onChange(v === "yes")}
                  columns={2}
                  options={yesNo as unknown as { value: string; label: string }[]}
                />
              )}
            />
          </Field>

          {attendsYouthService === false && (
            <Field>
              <Label htmlFor="not_attending_reason">
                If not, what's your reason(s)?
              </Label>
              <Textarea
                id="not_attending_reason"
                placeholder="Help us understand."
                {...register("not_attending_reason")}
              />
            </Field>
          )}

          <Field>
            <Label>Do you have a district and do you attend fellowships?</Label>
            <Controller
              control={control}
              name="has_district"
              render={({ field }) => (
                <RadioGroup
                  name="has_district"
                  value={
                    field.value === true ? "yes" : field.value === false ? "no" : undefined
                  }
                  onChange={(v) => field.onChange(v === "yes")}
                  columns={2}
                  options={yesNo as unknown as { value: string; label: string }[]}
                />
              )}
            />
          </Field>

          {hasDistrict === true && (
            <Field>
              <Label>Do you attend the district fellowships?</Label>
              <Controller
                control={control}
                name="attends_fellowship"
                render={({ field }) => (
                  <RadioGroup
                    name="attends_fellowship"
                    value={
                      field.value === true ? "yes" : field.value === false ? "no" : undefined
                    }
                    onChange={(v) => field.onChange(v === "yes")}
                    columns={2}
                    options={yesNo as unknown as { value: string; label: string }[]}
                  />
                )}
              />
            </Field>
          )}

          {hasDistrict === false && (
            <>
              <Field>
                <Label htmlFor="district_hindrance">
                  What has hindered you from joining a district?
                </Label>
                <Textarea
                  id="district_hindrance"
                  placeholder="Distance, schedule, didn't know about it…"
                  {...register("district_hindrance")}
                />
              </Field>
              <Field>
                <Label>Would you like to join a district?</Label>
                <Controller
                  control={control}
                  name="would_like_to_join"
                  render={({ field }) => (
                    <RadioGroup
                      name="would_like_to_join"
                      value={
                        field.value === true ? "yes" : field.value === false ? "no" : undefined
                      }
                      onChange={(v) => field.onChange(v === "yes")}
                      columns={2}
                      options={yesNo as unknown as { value: string; label: string }[]}
                    />
                  )}
                />
              </Field>
            </>
          )}
        </Section>
      )}

      {/* ---- SECTION D: Everyone ---- */}
      <Section
        index={isYouth ? "04" : "03"}
        title="Anything else?"
        subtitle="Open mic — for everyone."
      >
        <Field>
          <Label htmlFor="other_suggestions">
            Any other suggestion, advice, ideas or thoughts you may have
          </Label>
          <Textarea
            id="other_suggestions"
            placeholder="Type your suggestions here…"
            className="min-h-32"
            {...register("other_suggestions")}
          />
        </Field>
      </Section>

      <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={isSubmitting}
          className="sm:min-w-56"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Submitting…
            </>
          ) : (
            "Submit feedback"
          )}
        </Button>
        <p className="text-xs text-navy-500">
          Anonymous. Your responses help shape our calendar and ministries.
        </p>
      </div>
    </form>
  );
}

function Section({
  index,
  title,
  subtitle,
  children,
  accent,
}: {
  index: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section className={accent ? "rounded-2xl border border-gold-300/50 bg-gold-50/40 p-6 sm:p-8 -mx-2 sm:mx-0" : ""}>
      <div className="flex items-baseline gap-3 mb-6">
        <span className="font-display text-3xl text-gold-600 font-semibold">
          {index}
        </span>
        <div>
          <h2 className="font-display text-2xl text-navy-900 font-semibold leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-navy-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-7">{children}</div>
    </section>
  );
}
