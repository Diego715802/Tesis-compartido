BEGIN;
ALTER TABLE catalog.service_plans DROP CONSTRAINT service_plans_mikrotik_strategy_check;
ALTER TABLE catalog.service_plans ADD CONSTRAINT service_plans_mikrotik_strategy_check CHECK(mikrotik_strategy IN('simple_queue','queue_tree','ppp_profile','none','pcq_queue_tree','pcq_simple_queue','cake_simple_queue'));
COMMENT ON COLUMN catalog.service_plans.mikrotik_strategy IS 'Colas simples=simple_queue; pcq_w_queue_tree=pcq_queue_tree; pcq_w_simple_queue=pcq_simple_queue; Colas simples con cake=cake_simple_queue. No ejecuta aprovisionamiento.';
COMMIT;
